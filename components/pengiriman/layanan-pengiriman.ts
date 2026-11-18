import { supabase, logAktivitas } from "@/lib/supabase";
import type { Database, StatusPengiriman } from "@/lib/types";

export type PengirimanRow = Database["public"]["Tables"]["pengiriman"]["Row"];
export type LaporanKendalaRow =
  Database["public"]["Tables"]["laporan_kendala"]["Row"];

export type TransaksiLookup = {
  id: string;
  no_nota: string;
  perlu_dikirim: boolean;
  pelanggan?: { nama: string; alamat: string | null } | null;
};

export type PengirimLookup = {
  id: string;
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
      .select("*")
      .order("tanggal_penugasan", { ascending: false }),
    supabase
      .from("laporan_kendala")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("transaksi")
      .select(
        "id, no_nota, perlu_dikirim, pelanggan:pelanggan_id(nama, alamat)"
      )
      .order("tanggal", { ascending: false })
      .limit(50),
    supabase
      .from("pengguna")
      .select("id, nama, username")
      .eq("role", "pengirim")
      .eq("status", "aktif"),
  ]);

  if (krmRes.error) throw krmRes.error;

  return {
    list: (krmRes.data as PengirimanRow[]) || FALLBACK_PENGIRIMAN,
    kendalaList: (kdlRes.data as LaporanKendalaRow[]) || FALLBACK_KENDALA,
    transaksiList:
      (trxRes.data as unknown as TransaksiLookup[]) || FALLBACK_TRANSAKSI,
    pengirimList: (drvRes.data as PengirimLookup[]) || FALLBACK_PENGIRIM,
  };
}

export async function createDeliveryDB(
  newForm: NewPengirimanFormState,
  defaultPengirimId?: string
): Promise<void> {
  const payload = {
    transaksi_id: newForm.transaksi_id || null,
    pengirim_id: newForm.pengirim_id || defaultPengirimId || null,
    detail_penerima: newForm.detail_penerima.trim(),
    alamat_tujuan: newForm.alamat_tujuan.trim(),
    status: "belum_dikirim" as StatusPengiriman,
    tanggal_penugasan: new Date().toISOString(),
  };

  const { error: insErr } = await supabase.from("pengiriman").insert(payload);
  if (insErr) throw insErr;

  await logAktivitas({
    modul: "Pengiriman",
    aktivitas: `Menugaskan pengiriman baru ke ${payload.detail_penerima}`,
    dataSesudah: payload,
  });
}

export async function mulaiKirimDB(item: PengirimanRow): Promise<void> {
  const { error: updErr } = await supabase
    .from("pengiriman")
    .update({ status: "sedang_dikirim" })
    .eq("id", item.id);
  if (updErr) throw updErr;

  await logAktivitas({
    modul: "Pengiriman",
    aktivitas: `Memulai pengiriman untuk ${item.detail_penerima}`,
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
    namaPenerimaAktual,
    jenisKendala,
    alasanReturText,
    fotoDataUrl,
    fotoFileName,
    fotoMimeType,
  } = params;

  if (updateMode === "diterima") {
    if (!fotoDataUrl) {
      throw new Error(
        "Silakan ambil foto dari kamera atau upload foto bukti penerimaan terlebih dahulu (KRM-B4)."
      );
    }

    const finalFileName =
      fotoFileName || `bukti-${selectedItem.id.slice(0, 8)}-${Date.now()}.jpg`;
    let storedPhotoUrl = fotoDataUrl;

    // Coba upload ke Supabase Storage bucket `bukti-pengiriman` bila tersedia
    try {
      const resBlob = await fetch(fotoDataUrl);
      const blob = await resBlob.blob();
      const storagePath = `pengiriman/${selectedItem.id}/${Date.now()}-${finalFileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { data: upData, error: upErr } = await supabase.storage
        .from("bukti-pengiriman")
        .upload(storagePath, blob, {
          contentType: fotoMimeType || "image/jpeg",
          upsert: true,
        });
      if (!upErr && upData?.path) {
        const { data: pubUrl } = supabase.storage
          .from("bukti-pengiriman")
          .getPublicUrl(upData.path);
        if (pubUrl?.publicUrl) {
          // Tetap gunakan Data URL bila bucket privat agar pratinjau langsung tampil
          storedPhotoUrl = fotoDataUrl;
        }
      }
    } catch {
      // Gunakan Data URL terkompresi di kolom foto_bukti_url database
    }

    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        status: "diterima",
        nama_penerima_aktual:
          namaPenerimaAktual.trim() || selectedItem.detail_penerima,
        foto_bukti_url: storedPhotoUrl,
        foto_bukti_nama: finalFileName,
        foto_bukti_mime: fotoMimeType || "image/jpeg",
        tanggal_terima: new Date().toISOString(),
      })
      .eq("id", selectedItem.id);
    if (updErr) throw updErr;

    await logAktivitas({
      modul: "Pengiriman",
      aktivitas: `Pengiriman diterima oleh ${namaPenerimaAktual || selectedItem.detail_penerima} (Foto: ${finalFileName})`,
      dataSesudah: {
        status: "diterima",
        nama_penerima_aktual: namaPenerimaAktual,
        foto_bukti_nama: finalFileName,
      },
    });
  } else if (updateMode === "retur") {
    if (!alasanReturText.trim()) {
      throw new Error("Alasan retur wajib diisi.");
    }
    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        status: "gagal",
        alasan_retur: alasanReturText.trim(),
        ...(fotoDataUrl
          ? {
              foto_bukti_url: fotoDataUrl,
              foto_bukti_nama: fotoFileName || `retur-${Date.now()}.jpg`,
              foto_bukti_mime: fotoMimeType || "image/jpeg",
            }
          : {}),
      })
      .eq("id", selectedItem.id);
    if (updErr) throw updErr;

    await logAktivitas({
      modul: "Pengiriman",
      aktivitas: `Mencatat retur pengiriman ${selectedItem.detail_penerima}: ${alasanReturText}`,
      dataSesudah: { status: "gagal", alasan_retur: alasanReturText },
    });
  } else {
    // Laporan Kendala di perjalanan sesuai Class Diagram: LaporanKendala.+buatLaporan()
    const { error: kdlErr } = await supabase.from("laporan_kendala").insert({
      pengiriman_id: selectedItem.id,
      jenis_kendala: jenisKendala,
      deskripsi: alasanReturText.trim(),
      created_at: new Date().toISOString(),
    });
    if (kdlErr) throw kdlErr;

    const { error: updErr } = await supabase
      .from("pengiriman")
      .update({
        alasan_retur: `[KENDALA: ${jenisKendala}] ${alasanReturText.trim()}`,
        ...(fotoDataUrl
          ? {
              foto_bukti_url: fotoDataUrl,
              foto_bukti_nama: fotoFileName || `kendala-${Date.now()}.jpg`,
              foto_bukti_mime: fotoMimeType || "image/jpeg",
            }
          : {}),
      })
      .eq("id", selectedItem.id);
    if (updErr) throw updErr;

    await logAktivitas({
      modul: "Kendala Pengiriman",
      aktivitas: `Melaporkan kendala pengiriman (${jenisKendala}) ${selectedItem.detail_penerima}: ${alasanReturText}`,
      dataSesudah: {
        pengiriman_id: selectedItem.id,
        jenis_kendala: jenisKendala,
        deskripsi: alasanReturText,
      },
    });
  }
}
