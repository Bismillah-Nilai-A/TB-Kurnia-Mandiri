import { supabase, logAktivitas } from "@/lib/supabase";
import type { Database, JenisPelanggan, StatusKasbon } from "@/lib/types";

export type PelangganRow = Database["public"]["Tables"]["pelanggan"]["Row"];

export interface PiutangTransaksi {
  id: string;
  no_nota: string;
  pelanggan_id: string | null;
  total: number;
  jumlah_dibayar: number;
  sisa_tagihan: number;
  status_bayar: string;
  tanggal: string;
  pelanggan?: {
    nama: string;
    jenis: string;
    kontak: string | null;
    batas_kasbon: number;
  } | null;
}

export interface KasbonJoined {
  id: string;
  pelanggan_id: string;
  transaksi_id: string | null;
  jumlah_kasbon: number;
  status: StatusKasbon;
  alasan_penolakan: string | null;
  tanggal_pengajuan: string;
  tanggal_keputusan: string | null;
  pelanggan?: { nama: string; batas_kasbon: number } | null;
  transaksi?: { no_nota: string; total: number; sisa_tagihan: number } | null;
}

export interface KwitansiBayarState {
  noNota: string;
  pelanggan: string;
  nominal: number;
  sisaBaru: number;
  metode: string;
  tanggal: string;
}

export interface PelangganFormState {
  nama: string;
  jenis: JenisPelanggan;
  kontak: string;
  alamat: string;
  batas_kasbon: string;
  status_kasbon: StatusKasbon;
}

export const FALLBACK_TAGIHAN: PiutangTransaksi[] = [];
export const FALLBACK_KASBON: KasbonJoined[] = [];
export const FALLBACK_PELANGGAN: PelangganRow[] = [];

export const DEFAULT_PELANGGAN_FORM: PelangganFormState = {
  nama: "",
  jenis: "proyek",
  kontak: "",
  alamat: "",
  batas_kasbon: "25000000",
  status_kasbon: "aktif",
};

export async function fetchAllPiutangData(): Promise<{
  pelangganList: PelangganRow[];
  tagihanList: PiutangTransaksi[];
  kasbonList: KasbonJoined[];
}> {
  const [plgRes, trxRes, ksbRes] = await Promise.all([
    supabase
      .from("pelanggan")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("transaksi")
      .select(
        `
        id, no_nota, pelanggan_id, total, jumlah_dibayar, sisa_tagihan, status_bayar, tanggal,
        pelanggan:pelanggan_id(nama, jenis, kontak, batas_kasbon)
      `
      )
      .gt("sisa_tagihan", 0)
      .order("tanggal", { ascending: false }),
    supabase
      .from("kasbon")
      .select(
        `
        *,
        pelanggan:pelanggan_id(nama, batas_kasbon),
        transaksi:transaksi_id(no_nota, total, sisa_tagihan)
      `
      )
      .order("tanggal_pengajuan", { ascending: false }),
  ]);

  if (plgRes.error) throw plgRes.error;

  return {
    pelangganList: (plgRes.data as PelangganRow[]) || FALLBACK_PELANGGAN,
    tagihanList:
      (trxRes.data as unknown as PiutangTransaksi[]) || FALLBACK_TAGIHAN,
    kasbonList: (ksbRes.data as unknown as KasbonJoined[]) || FALLBACK_KASBON,
  };
}

export async function prosesPembayaranPiutangDB(params: {
  bayarModal: PiutangTransaksi;
  nominal: number;
  metodeBayar: "tunai" | "transfer";
  buktiTransferRef: string;
}): Promise<KwitansiBayarState> {
  const { bayarModal, nominal, metodeBayar, buktiTransferRef } = params;
  const sisaSaatIni = Number(bayarModal.sisa_tagihan);
  const dibayarBaru = Number(bayarModal.jumlah_dibayar) + nominal;
  const sisaBaru = Math.max(0, sisaSaatIni - nominal);
  const statusBaru = sisaBaru === 0 ? "lunas" : "sebagian";

  // 1. Insert ke tabel pembayaran
  const { error: payErr } = await supabase.from("pembayaran").insert({
    transaksi_id: bayarModal.id,
    metode: metodeBayar,
    nominal,
    bukti_transfer_url:
      metodeBayar === "transfer" ? buktiTransferRef || "TF-VERIFIED" : null,
    status: "berhasil",
    tanggal: new Date().toISOString(),
  });
  if (payErr) throw payErr;

  // 2. Update transaksi
  const { error: trxErr } = await supabase
    .from("transaksi")
    .update({
      jumlah_dibayar: dibayarBaru,
      sisa_tagihan: sisaBaru,
      status_bayar: statusBaru,
    })
    .eq("id", bayarModal.id);
  if (trxErr) throw trxErr;

  // 3. Jika lunas, update status kasbon terkait menjadi lunas
  if (sisaBaru === 0) {
    await supabase
      .from("kasbon")
      .update({ status: "lunas" })
      .eq("transaksi_id", bayarModal.id);
  }

  await logAktivitas({
    modul: "Pembayaran Piutang",
    aktivitas: `Menerima pembayaran piutang nota ${bayarModal.no_nota} sebesar Rp ${nominal.toLocaleString("id-ID")} (Sisa: Rp ${sisaBaru.toLocaleString("id-ID")})`,
    dataSebelum: { sisa_tagihan: sisaSaatIni },
    dataSesudah: {
      nominal_bayar: nominal,
      sisa_tagihan: sisaBaru,
      status_bayar: statusBaru,
    },
  });

  const pelangganNama = bayarModal.pelanggan?.nama || "Pelanggan";
  return {
    noNota: bayarModal.no_nota,
    pelanggan: pelangganNama,
    nominal,
    sisaBaru,
    metode: metodeBayar.toUpperCase(),
    tanggal: new Date().toLocaleString("id-ID"),
  };
}

export async function setujuiKasbonDB(ksb: KasbonJoined): Promise<void> {
  const { error: updErr } = await supabase
    .from("kasbon")
    .update({
      status: "disetujui",
      tanggal_keputusan: new Date().toISOString(),
    })
    .eq("id", ksb.id);
  if (updErr) throw updErr;

  // Catat notifikasi outbox & kirim ke muhamadirfan.mi966@gmail.com
  await supabase.from("notifikasi").insert({
    jenis: "kasbon_disetujui",
    penerima: "muhamadirfan.mi966@gmail.com",
    saluran: "email",
    pesan: `Pengajuan kasbon (${ksb.pelanggan?.nama || "Pelanggan"}) sebesar Rp ${Number(ksb.jumlah_kasbon).toLocaleString("id-ID")} untuk nota ${ksb.transaksi?.no_nota || "-"} telah DISETUJUI oleh Admin.`,
    status_kirim: "pending",
    waktu: new Date().toISOString(),
  });
  fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

  await logAktivitas({
    modul: "Kasbon",
    aktivitas: `Menyetujui kasbon ${ksb.pelanggan?.nama || ""} sebesar Rp ${Number(ksb.jumlah_kasbon).toLocaleString("id-ID")}`,
    dataSebelum: { status: ksb.status },
    dataSesudah: { status: "disetujui" },
  });
}

export async function tolakKasbonDB(
  tolakModal: KasbonJoined,
  alasanPenolakan: string
): Promise<void> {
  const { error: updErr } = await supabase
    .from("kasbon")
    .update({
      status: "ditolak",
      alasan_penolakan: alasanPenolakan.trim(),
      tanggal_keputusan: new Date().toISOString(),
    })
    .eq("id", tolakModal.id);
  if (updErr) throw updErr;

  if (tolakModal.transaksi_id) {
    await supabase
      .from("transaksi")
      .update({
        status_bayar: "dibatalkan",
        sisa_tagihan: 0,
      })
      .eq("id", tolakModal.transaksi_id);
  }

  await logAktivitas({
    modul: "Kasbon",
    aktivitas: `Menolak kasbon ${tolakModal.pelanggan?.nama || ""}: ${alasanPenolakan}`,
    dataSebelum: { status: tolakModal.status },
    dataSesudah: { status: "ditolak", alasan_penolakan: alasanPenolakan },
  });
}

export async function simpanPelangganDB(
  pelangganForm: PelangganFormState,
  editingPelanggan: PelangganRow | null
): Promise<void> {
  const payload = {
    nama: pelangganForm.nama.trim(),
    jenis: pelangganForm.jenis,
    kontak: pelangganForm.kontak.trim() || null,
    alamat: pelangganForm.alamat.trim() || null,
    batas_kasbon: Number(pelangganForm.batas_kasbon) || 0,
    status_kasbon: pelangganForm.status_kasbon,
  };

  if (editingPelanggan) {
    const { error: updErr } = await supabase
      .from("pelanggan")
      .update(payload)
      .eq("id", editingPelanggan.id);
    if (updErr) throw updErr;

    await logAktivitas({
      modul: "Pelanggan",
      aktivitas: `Mengubah data pelanggan ${payload.nama}`,
      dataSesudah: payload,
    });
  } else {
    const { error: insErr } = await supabase
      .from("pelanggan")
      .insert(payload);
    if (insErr) throw insErr;

    await logAktivitas({
      modul: "Pelanggan",
      aktivitas: `Menambah pelanggan baru ${payload.nama}`,
      dataSesudah: payload,
    });
  }
}

export async function hapusPelangganDB(p: PelangganRow): Promise<void> {
  const { error: delErr } = await supabase
    .from("pelanggan")
    .delete()
    .eq("id", p.id);
  if (delErr) throw delErr;

  await logAktivitas({
    modul: "Pelanggan",
    aktivitas: `Menghapus pelanggan ${p.nama}`,
  });
}
