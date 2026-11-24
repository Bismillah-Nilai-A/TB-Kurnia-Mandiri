import { supabase, logAktivitas } from "@/lib/supabase";
import type { Database, StatusPengiriman } from "@/lib/types";

export type PengirimanRow =
  Database["public"]["Tables"]["pengiriman"]["Row"] & {
    id: string;
    transaksi?: {
      no_nota: string;
      pelanggan?: { nama: string; alamat: string | null } | null;
    } | null;
    pengirim?: { nama: string; username: string } | null;
    // Properti turunan kompatibilitas untuk komponen UI
    detail_penerima?: string | null;
    nama_penerima_aktual?: string | null;
    foto_bukti_nama?: string | null;
    foto_bukti_mime?: string | null;
    alasan_retur?: string | null;
  };

export type LaporanKendalaRow =
  Database["public"]["Tables"]["laporan_kendala"]["Row"] & {
    id: string;
  };

export type TransaksiLookup = {
  id: string;
  id_transaksi?: string;
  no_nota: string;
  perlu_dikirim: boolean;
  pelanggan?: { nama: string; alamat: string | null } | null;
};

export type PengirimLookup = {
  id: string;
  id_pengguna?: string;
  nama: string;
  username: string;
};

export type UpdatePengirimanMode = "diterima" | "retur" | "kendala";

export interface NewPengirimanFormState {
  transaksi_id: string;
  pengirim_id: string;
  detail_penerima: string;
  alamat_tujuan: string;
}

export const FALLBACK_PENGIRIMAN: PengirimanRow[] = [];
export const FALLBACK_KENDALA: LaporanKendalaRow[] = [];
export const FALLBACK_TRANSAKSI: TransaksiLookup[] = [];
export const FALLBACK_PENGIRIM: PengirimLookup[] = [];

export const DEFAULT_NEW_PENGIRIMAN_FORM: NewPengirimanFormState = {
  transaksi_id: "",
  pengirim_id: "",
  detail_penerima: "",
  alamat_tujuan: "",
};

export function compressCanvasFromSource(
  source: HTMLImageElement | HTMLVideoElement,
  width: number,
  height: number,
  maxDim = 900
): string | null {
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxDim / Math.max(width, height));
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
      img.onload = () => {
        const compressed = compressCanvasFromSource(
          img,
          img.width,
          img.height,
          900
        );
        if (compressed) {
          resolve(compressed);
        } else {
          reject(new Error("Gagal mengompresi foto."));
        }
      };
      img.src = String(ev.target?.result || "");
    };
    reader.readAsDataURL(file);
  });
}

export async function fetchAllPengirimanData(): Promise<{
  list: PengirimanRow[];
  kendalaList: LaporanKendalaRow[];
  transaksiList: TransaksiLookup[];
  pengirimList: PengirimLookup[];
}> {
  const [krmRes, kdlRes, trxRes, drvRes] = await Promise.all([
    supabase
      .from("pengiriman")
      .select(
        `
        *,
        transaksi:transaksi_id(no_nota, pelanggan:pelanggan_id(nama, alamat)),
        pengirim:pengirim_id(nama, username)
      `
      )
      .order("tanggal_penugasan", { ascending: false }),
    supabase
      .from("laporan_kendala")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("transaksi")
      .select(
        "id_transaksi, no_nota, perlu_dikirim, pelanggan:pelanggan_id(nama, alamat)"
      )
      .order("tanggal", { ascending: false })
      .limit(50),
    supabase
      .from("pengguna")
      .select("id_pengguna, nama, username")
      .eq("role", "pengirim")
      .eq("status", "aktif"),
  ]);

  if (krmRes.error) throw krmRes.error;

  const list: PengirimanRow[] = (
    (krmRes.data || []) as Array<Record<string, unknown>>
  ).map((raw) => {
    const trx = (raw.transaksi as Record<string, unknown>) || null;
    const plg = (trx?.pelanggan as Record<string, unknown>) || null;
    const pgr = (raw.pengirim as Record<string, unknown>) || null;
    const labelPenerima = plg?.nama
      ? `${String(plg.nama)}${trx?.no_nota ? ` (${String(trx.no_nota)})` : ""}`
      : trx?.no_nota
        ? `Pelanggan (${String(trx.no_nota)})`
        : "Pelanggan CV Kurnia Mandiri";
    const idKrm = String(raw.id_pengiriman || raw.id);

    return {
      id_pengiriman: idKrm,
      id: idKrm,
      transaksi_id: raw.transaksi_id ? String(raw.transaksi_id) : null,
      pengirim_id: raw.pengirim_id ? String(raw.pengirim_id) : null,
      alamat_tujuan: String(raw.alamat_tujuan || ""),
      status: (raw.status as StatusPengiriman) || "belum_dikirim",
      foto_bukti_url: raw.foto_bukti_url ? String(raw.foto_bukti_url) : null,
      alasan_penukaran: raw.alasan_penukaran
        ? String(raw.alasan_penukaran)
        : null,
      tanggal_penugasan: String(raw.tanggal_penugasan),
      tanggal_terima: raw.tanggal_terima ? String(raw.tanggal_terima) : null,
      transaksi: trx
        ? {
            no_nota: String(trx.no_nota),
            pelanggan: plg
              ? {
                  nama: String(plg.nama),
                  alamat: plg.alamat ? String(plg.alamat) : null,
                }
              : null,
          }
        : null,
      pengirim: pgr
        ? {
            nama: String(pgr.nama),
            username: String(pgr.username),
          }
        : null,
      detail_penerima: labelPenerima,
      nama_penerima_aktual: plg?.nama ? String(plg.nama) : labelPenerima,
      foto_bukti_nama: raw.foto_bukti_url ? "bukti-penerimaan.jpg" : null,
      foto_bukti_mime: "image/jpeg",
      alasan_retur: raw.alasan_penukaran ? String(raw.alasan_penukaran) : null,
    };
  });

  const kendalaList: LaporanKendalaRow[] = (
    (kdlRes.data || []) as Array<Record<string, unknown>>
  ).map((k) => ({
    ...(k as unknown as LaporanKendalaRow),
    id_laporan: String(k.id_laporan || k.id),
    id: String(k.id_laporan || k.id),
  }));

  const transaksiList: TransaksiLookup[] = (
    (trxRes.data || []) as Array<Record<string, unknown>>
  ).map((t) => ({
    ...(t as unknown as TransaksiLookup),
    id_transaksi: String(t.id_transaksi || t.id),
    id: String(t.id_transaksi || t.id),
  }));

  const pengirimList: PengirimLookup[] = (
    (drvRes.data || []) as Array<Record<string, unknown>>
  ).map((d) => ({
    ...(d as unknown as PengirimLookup),
    id_pengguna: String(d.id_pengguna || d.id),
    id: String(d.id_pengguna || d.id),
  }));

  return {
    list,
    kendalaList,
    transaksiList,
    pengirimList,
  };
}

export async function createDeliveryDB(
  newForm: NewPengirimanFormState,
  defaultPengirimId?: string
): Promise<void> {
  const payload = {
    transaksi_id: newForm.transaksi_id || null,
    pengirim_id: newForm.pengirim_id || defaultPengirimId || null,
    alamat_tujuan: newForm.alamat_tujuan.trim(),
    status: "belum_dikirim" as StatusPengiriman,
    tanggal_penugasan: new Date().toISOString(),
  };

  const { error: insErr } = await supabase.from("pengiriman").insert(payload);
  if (insErr) throw insErr;

  await supabase.from("notifikasi").insert({
    jenis: "notifikasi_other",
    penerima: "muhamadirfan.mi966@gmail.com",
    saluran: "email",
    pesan: `Penugasan pengiriman baru dibuat ke alamat: ${payload.alamat_tujuan}.`,
    status_kirim: "pending",
    waktu: new Date().toISOString(),
  });
  fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

  await logAktivitas({
    modul: "Pengiriman",
    aktivitas: `Buat penugasan kirim`.slice(0, 50),
    dataSesudah: payload,
  });
}

export async function mulaiKirimDB(item: PengirimanRow): Promise<void> {
  const { error: updErr } = await supabase
    .from("pengiriman")
    .update({ status: "sedang_dikirim" })
    .eq("id_pengiriman", item.id_pengiriman || item.id);
  if (updErr) throw updErr;

  await logAktivitas({
    modul: "Pengiriman",
    aktivitas: `Mulai pengiriman ${item.transaksi?.no_nota || ""}`.slice(0, 50),
    dataSebelum: { status: item.status },
    dataSesudah: { status: "sedang_dikirim" },
  });
}

export async function updateDeliveryActionDB(params: {
  selectedItem: PengirimanRow;
  updateMode: UpdatePengirimanMode;
  namaPenerimaAktual: string;
  jenisKendala: string;
  alasanReturText: string;
  fotoDataUrl: string | null;
  fotoFileName: string;
  fotoMimeType: string;
}): Promise<void> {
  const {
    selectedItem,
    updateMode,
    jenisKendala,
    alasanReturText,
    fotoDataUrl,
    fotoFileName,
    fotoMimeType,
  } = params;

  if (updateMode === "diterima") {
    if (!fotoDataUrl) {
      throw new Error(
        "Silakan ambil foto dari kamera atau upload foto bukti penerimaan terlebih dahulu."
      );
    }

    const finalFileName =
      fotoFileName || `bukti-${selectedItem.id.slice(0, 8)}-${Date.now()}.jpg`;
    let storedPhotoUrl = fotoDataUrl;

    try {
      const resBlob = await fetch(fotoDataUrl);
      const blob = await resBlob.blob();
      const storagePath = `pengiriman/${selectedItem.id}/${Date.now()}-${finalFileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from("bukti-pengiriman")
        .upload(storagePath, blob, {
          contentType: fotoMimeType || "image/jpeg",
          upsert: false,
        });
      if (!upErr && upData?.path) {
        const { data: pubUrl } = supabase.storage
          .from("bukti-pengiriman")
          .getPublicUrl(upData.path);
        if (pubUrl?.publicUrl) {
          storedPhotoUrl = pubUrl.publicUrl;
        }
      }
    } catch {
      // Gunakan Data URL terkompresi di kolom foto_bukti_url database
    }

    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        status: "diterima",
        foto_bukti_url: storedPhotoUrl,
        tanggal_terima: new Date().toISOString(),
      })
      .eq("id_pengiriman", selectedItem.id_pengiriman || selectedItem.id);
    if (updErr) throw updErr;

    await supabase.from("notifikasi").insert({
      jenis: "notifikasi_other",
      penerima: "muhamadirfan.mi966@gmail.com",
      saluran: "email",
      pesan: `Pengiriman untuk ${selectedItem.detail_penerima || "Pelanggan"} telah diterima di lokasi tujuan.`,
      status_kirim: "pending",
      waktu: new Date().toISOString(),
    });
    fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

    await logAktivitas({
      modul: "Pengiriman",
      aktivitas: `Pengiriman selesai ${selectedItem.transaksi?.no_nota || ""}`.slice(
        0,
        50
      ),
      dataSesudah: {
        status: "diterima",
      },
    });
  } else if (updateMode === "retur") {
    if (!alasanReturText.trim()) {
      throw new Error("Alasan pengajuan penukaran wajib diisi.");
    }

    // Sesuai Class Diagram & ERD: Pengiriman.+catatPengajuanPenukaran() & Tabel Penukaran (menyimpan foto di foto_bukti_url)
    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        status: "gagal",
        alasan_penukaran: alasanReturText.trim(),
        ...(fotoDataUrl
          ? {
              foto_bukti_url: fotoDataUrl,
            }
          : {}),
      })
      .eq("id_pengiriman", selectedItem.id_pengiriman || selectedItem.id);
    if (updErr) throw updErr;

    if (selectedItem.transaksi_id) {
      await supabase.from("penukaran").insert({
        transaksi_id: selectedItem.transaksi_id,
        status: "menunggu",
        alasan_penukaran: alasanReturText.trim(),
        selisih_harga: 0,
        tanggal_pengajuan: new Date().toISOString(),
      });
    }

    await supabase.from("notifikasi").insert({
      jenis: "notifikasi_other",
      penerima: "muhamadirfan.mi966@gmail.com",
      saluran: "email",
      pesan: `Pengajuan penukaran barang dicatat dari pengiriman ${selectedItem.detail_penerima || ""}: ${alasanReturText.trim()}`,
      status_kirim: "pending",
      waktu: new Date().toISOString(),
    });
    fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

    await logAktivitas({
      modul: "Pengiriman",
      aktivitas: `Pengajuan penukaran pengiriman`.slice(0, 50),
      dataSesudah: {
        status: "gagal",
        alasan_penukaran: alasanReturText.trim(),
      },
    });
  } else {
    // Laporan Kendala di perjalanan sesuai Class Diagram: LaporanKendala.+buatLaporan()
    const pengirimanId = selectedItem.id_pengiriman || selectedItem.id;
    const { error: kdlErr } = await supabase.from("laporan_kendala").insert({
      pengiriman_id: pengirimanId,
      jenis_kendala: jenisKendala.slice(0, 30),
      deskripsi: alasanReturText.trim(),
      created_at: new Date().toISOString(),
    });
    if (kdlErr) throw kdlErr;

    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        alasan_penukaran: `[KENDALA: ${jenisKendala}] ${alasanReturText.trim()}`,
        ...(fotoDataUrl
          ? {
              foto_bukti_url: fotoDataUrl,
            }
          : {}),
      })
      .eq("id_pengiriman", pengirimanId);
    if (updErr) throw updErr;

    await supabase.from("notifikasi").insert({
      jenis: "notifikasi_other",
      penerima: "muhamadirfan.mi966@gmail.com",
      saluran: "email",
      pesan: `Laporan kendala pengiriman (${jenisKendala}) pada ${selectedItem.detail_penerima || ""}: ${alasanReturText.trim()}`,
      status_kirim: "pending",
      waktu: new Date().toISOString(),
    });
    fetch("/api/cron/notifikasi", { method: "POST" }).catch(() => {});

    await logAktivitas({
      modul: "Kendala Pengiriman",
      aktivitas: `Kendala pengiriman (${jenisKendala})`.slice(0, 50),
      dataSesudah: {
        pengiriman_id: selectedItem.id,
        jenis_kendala: jenisKendala,
        deskripsi: alasanReturText,
      },
    });
  }
}
