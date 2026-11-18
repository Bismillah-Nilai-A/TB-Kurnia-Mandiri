import { supabase, logAktivitas, getCurrentUser } from "@/lib/supabase";
import type { Database } from "@/lib/types";

export type BarangRow = Database["public"]["Tables"]["barang"]["Row"];

export interface MutasiJoined {
  id: string;
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  harga_satuan: number;
  total_harga: number;
  keterangan: string | null;
  mutasi: {
    id: string;
    jenis: "masuk" | "keluar" | "retur";
    supplier: string | null;
    no_referensi: string | null;
    tujuan: string | null;
    alasan: string | null;
    tanggal: string;
  } | null;
  barang: {
    kode_barang: string;
    nama: string;
    satuan: string;
  } | null;
}

export interface RestokJoined {
  id: string;
  barang_id: string;
  restok: number;
  jumlah_restok?: number;
  status?: string;
  target: string | null;
  tanggal: string;
  barang?: {
    kode_barang: string;
    nama: string;
    stok: number;
    stok_min: number;
    satuan: string;
  } | null;
}

export interface FormBarangState {
  kode_barang: string;
  nama: string;
  kategori: string;
  merk: string;
  barcode: string;
  harga_beli: string;
  harga: string;
  stok_awal: string;
  stok: string;
  stok_min: string;
  satuan: string;
  keterangan: string;
}

export interface FormMutasiState {
  jenis: "masuk" | "keluar";
  barang_id: string;
  jumlah: string;
  supplier: string;
  no_referensi: string;
  tujuan: string;
  keterangan: string;
}

export interface FormRestokState {
  barang_id: string;
  restok: string;
  target: string;
}

export const INITIAL_KATALOG: BarangRow[] = [];
export const INITIAL_MUTASI: MutasiJoined[] = [];
export const INITIAL_RESTOK: RestokJoined[] = [];

export interface Code128Segment {
  key: string;
  color: "black" | "white";
  width: number;
}

export function renderCode128SVG(value: string): Code128Segment[] {
  return value.split("").flatMap((ch, idx) => {
    const code = ch.charCodeAt(0);
    return [
      { key: `${idx}-a`, color: "black" as const, width: (code % 3) + 1 },
      {
        key: `${idx}-s`,
        color: "white" as const,
        width: ((code >> 1) % 2) + 1,
      },
      {
        key: `${idx}-b`,
        color: "black" as const,
        width: ((code >> 2) % 3) + 1,
      },
    ];
  });
}

export async function fetchAllBarangData(): Promise<{
  items: BarangRow[];
  mutasiList: MutasiJoined[];
  restokList: RestokJoined[];
}> {
  const [brgRes, mutRes, rstRes] = await Promise.all([
    supabase
      .from("barang")
      .select("*")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("detail_mutasi_barang")
      .select(
        `
        id, jumlah, stok_sebelum, stok_sesudah, harga_satuan, total_harga, keterangan,
        mutasi:mutasi_barang(id, jenis, supplier, no_referensi, tujuan, alasan, tanggal),
        barang:barang(kode_barang, nama, satuan)
      `
      )
      .order("id", { ascending: false })
      .limit(100),
    supabase
      .from("rencana_restok")
      .select(
        `
        id, barang_id, restok, jumlah_restok, status, target, tanggal,
        barang:barang(kode_barang, nama, stok, stok_min, satuan)
      `
      )
      .order("tanggal", { ascending: false }),
  ]);

  if (brgRes.error) throw brgRes.error;

  return {
    items: (brgRes.data as BarangRow[]) || INITIAL_KATALOG,
    mutasiList: (mutRes.data as unknown as MutasiJoined[]) || INITIAL_MUTASI,
    restokList: (rstRes.data as unknown as RestokJoined[]) || INITIAL_RESTOK,
  };
}

export async function simpanBarangKeDatabase(
  formData: FormBarangState,
  editingItem: BarangRow | null
): Promise<void> {
  const hargaBeliNum = Number(formData.harga_beli) || 0;
  const hargaJualNum =
    Number(formData.harga) || Math.round(hargaBeliNum * 1.3);
  const stokNum = Number(formData.stok) || 0;
  const stokAwalNum = Number(formData.stok_awal) || stokNum;

  const payload = {
    kode_barang: formData.kode_barang.trim(),
    nama: formData.nama.trim(),
    kategori: formData.kategori.trim(),
    merk: formData.merk.trim() || null,
    barcode: formData.barcode.trim() || null,
    harga_beli: hargaBeliNum,
    harga: hargaJualNum,
    stok_awal: stokAwalNum,
    stok: stokNum,
    stok_min: Number(formData.stok_min) || 5,
    stok_minimum: Number(formData.stok_min) || 5,
    satuan: formData.satuan.trim() || "pcs",
    keterangan: formData.keterangan.trim() || null,
  };

  if (editingItem) {
    const { error: updateErr } = await supabase
      .from("barang")
      .update(payload)
      .eq("id", editingItem.id);
    if (updateErr) throw updateErr;

    await logAktivitas({
      modul: "Barang",
      aktivitas: `Mengubah data barang ${payload.kode_barang} - ${payload.nama}`,
      dataSebelum:
        editingItem as unknown as Database["public"]["Tables"]["log_aktivitas"]["Row"]["data_sebelum"],
      dataSesudah: payload,
    });
  } else {
    const { error: insertErr } = await supabase
      .from("barang")
      .insert(payload);
    if (insertErr) throw insertErr;

    await logAktivitas({
      modul: "Barang",
      aktivitas: `Menambah barang baru ${payload.kode_barang} - ${payload.nama}`,
      dataSesudah: payload,
    });
  }
}

export async function hapusBarangDariDatabase(item: BarangRow): Promise<void> {
  const { error: delError } = await supabase
    .from("barang")
    .delete()
    .eq("id", item.id);
  if (delError) throw delError;

  await logAktivitas({
    modul: "Barang",
    aktivitas: `Menghapus barang ${item.kode_barang} - ${item.nama}`,
    dataSebelum: { kode_barang: item.kode_barang, nama: item.nama },
  });
}

export async function simpanMutasiKeDatabase(
  mutasiForm: FormMutasiState,
  items: BarangRow[]
): Promise<void> {
  const targetItem = items.find((i) => i.id === mutasiForm.barang_id);
  if (!targetItem) {
    throw new Error("Pilih barang terlebih dahulu.");
  }
  const qty = Number(mutasiForm.jumlah) || 0;
  if (qty <= 0) {
    throw new Error("Jumlah mutasi harus lebih dari 0.");
  }

  const stokSebelum = targetItem.stok;
  const stokSesudah =
    mutasiForm.jenis === "masuk" ? stokSebelum + qty : stokSebelum - qty;

  if (stokSesudah < 0) {
    throw new Error(
      `Stok tidak mencukupi! Stok saat ini: ${stokSebelum} ${targetItem.satuan}.`
    );
  }

  const user = await getCurrentUser();
  const hargaSatuan =
    mutasiForm.jenis === "masuk"
      ? Number(targetItem.harga_beli) || Number(targetItem.harga)
      : Number(targetItem.harga);
  const totalHarga = hargaSatuan * qty;

  // 1. Insert mutasi_barang header
  const { data: mutHeader, error: mutErr } = await supabase
    .from("mutasi_barang")
    .insert({
      pengguna_id: user?.id || null,
      jenis: mutasiForm.jenis,
      supplier:
        mutasiForm.jenis === "masuk"
          ? mutasiForm.supplier || "Pemasok Umum"
          : null,
      no_referensi:
        mutasiForm.no_referensi || `MUT-${Date.now().toString().slice(-6)}`,
      tujuan:
        mutasiForm.jenis === "keluar"
          ? mutasiForm.tujuan || "Operasional / Proyek"
          : "Gudang Utama CV Kurnia Mandiri",
      alasan: mutasiForm.keterangan || null,
      tanggal: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (mutErr || !mutHeader) throw mutErr || new Error("Gagal membuat mutasi");

  // 2. Insert detail_mutasi_barang
  const { error: detErr } = await supabase
    .from("detail_mutasi_barang")
    .insert({
      mutasi_id: mutHeader.id,
      barang_id: targetItem.id,
      jumlah: qty,
      stok_sebelum: stokSebelum,
      stok_sesudah: stokSesudah,
      harga_satuan: hargaSatuan,
      total_harga: totalHarga,
      keterangan:
        mutasiForm.keterangan ||
        (mutasiForm.jenis === "masuk" ? "Barang Masuk" : "Barang Keluar"),
    });
  if (detErr) throw detErr;

  // 3. Update stok barang & catat histori tabel stok
  const { error: updErr } = await supabase
    .from("barang")
    .update({ stok: stokSesudah })
    .eq("id", targetItem.id);
  if (updErr) throw updErr;

  await supabase.from("stok").insert({
    barang_id: targetItem.id,
    stok_awal: stokSebelum,
    stok_akhir: stokSesudah,
    tipe: mutasiForm.jenis,
    tanggal: new Date().toISOString(),
  });

  await logAktivitas({
    modul: "Mutasi Barang",
    aktivitas: `Mencatat barang ${mutasiForm.jenis} (${qty} ${targetItem.satuan}) untuk ${targetItem.kode_barang} - ${targetItem.nama}`,
    dataSebelum: { stok: stokSebelum },
    dataSesudah: { stok: stokSesudah, jumlah: qty },
  });
}

export async function simpanRestokKeDatabase(
  restokForm: FormRestokState,
  items: BarangRow[]
): Promise<void> {
  const targetItem = items.find((i) => i.id === restokForm.barang_id);
  if (!targetItem) throw new Error("Pilih barang untuk rencana restok.");

  const qty = Number(restokForm.restok) || 10;
  const { error: rstErr } = await supabase.from("rencana_restok").insert({
    barang_id: targetItem.id,
    restok: qty,
    jumlah_restok: qty,
    status: "direncanakan",
    target: restokForm.target || "Rencana pengadaan internal",
    tanggal: new Date().toISOString(),
  });
  if (rstErr) throw rstErr;

  // Catat ke outbox notifikasi (D16) & kirim ke muhamadirfan.mi966@gmail.com
  await supabase.from("notifikasi").insert({
    jenis: "stok_hampir_habis",
    penerima: "muhamadirfan.mi966@gmail.com",
    saluran: "email",
    pesan: `Rencana restok dibuat untuk ${targetItem.kode_barang} - ${targetItem.nama} sebanyak ${qty} ${targetItem.satuan} (Sisa stok: ${targetItem.stok}).`,
    status_kirim: "pending",
    waktu: new Date().toISOString(),
  });
  fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

  await logAktivitas({
    modul: "Rencana Restok",
    aktivitas: `Membuat rencana restok ${targetItem.kode_barang} - ${targetItem.nama} (${qty} ${targetItem.satuan})`,
    dataSesudah: {
      barang: targetItem.nama,
      restok: qty,
      target: restokForm.target,
    },
  });
}

export async function ubahStatusRestokDiDatabase(
  r: RestokJoined,
  nextStatus: string
): Promise<void> {
  const { error: updErr } = await supabase
    .from("rencana_restok")
    .update({ status: nextStatus })
    .eq("id", r.id);
  if (updErr) throw updErr;

  await logAktivitas({
    modul: "Rencana Restok",
    aktivitas: `Mengubah status rencana restok ${r.barang?.kode_barang || ""} menjadi ${nextStatus.toUpperCase()}`,
    dataSebelum: { status: r.status || "direncanakan" },
    dataSesudah: { status: nextStatus },
  });
}
