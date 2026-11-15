"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SearchField,
  Input,
  Label,
} from "@/components/ui";
import { supabase, logAktivitas } from "@/lib/supabase";
import {
  Truck,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Camera,
  Upload,
  MapPin,
  Eye,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import type { Database, StatusPengiriman } from "@/lib/types";

type PengirimanRow = Database["public"]["Tables"]["pengiriman"]["Row"];
type LaporanKendalaRow = Database["public"]["Tables"]["laporan_kendala"]["Row"];
type TransaksiLookup = {
  id: string;
  no_nota: string;
  perlu_dikirim: boolean;
  pelanggan?: { nama: string; alamat: string | null } | null;
};
type PengirimLookup = {
  id: string;
  nama: string;
  username: string;
};

export default function PengirimanPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("SEMUA");
  const [list, setList] = useState<PengirimanRow[]>([]);
  const [kendalaList, setKendalaList] = useState<LaporanKendalaRow[]>([]);
  const [transaksiList, setTransaksiList] = useState<TransaksiLookup[]>([]);
  const [pengirimList, setPengirimList] = useState<PengirimLookup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Modal Buat Penugasan Pengiriman (+buatPenugasan() sesuai Class Diagram)
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    transaksi_id: "",
    pengirim_id: "",
    detail_penerima: "",
    alamat_tujuan: "",
  });

  // Modal Update Status / Upload Bukti / Retur / Laporan Kendala (+perbaruiStatus, +unggahBukti, +catatRetur, LaporanKendala.+buatLaporan)
  const [selectedItem, setSelectedItem] = useState<PengirimanRow | null>(null);
  const [updateMode, setUpdateMode] = useState<"diterima" | "retur" | "kendala">(
    "diterima"
  );
  const [namaPenerimaAktual, setNamaPenerimaAktual] = useState("");
  const [jenisKendala, setJenisKendala] = useState("Kendala Akses / Alamat");
  const [alasanReturText, setAlasanReturText] = useState("");

  // State Kamera & Upload Foto Bukti (D15 / KRM-B4)
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const [fotoFileName, setFotoFileName] = useState<string>("");
  const [fotoMimeType, setFotoMimeType] = useState<string>("image/jpeg");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Modal Lihat Foto Bukti Ukuran Penuh
  const [previewItem, setPreviewItem] = useState<PengirimanRow | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
          .select("id, no_nota, perlu_dikirim, pelanggan:pelanggan_id(nama, alamat)")
          .order("tanggal", { ascending: false })
          .limit(50),
        supabase
          .from("pengguna")
          .select("id, nama, username")
          .eq("role", "pengirim")
          .eq("status", "aktif"),
      ]);

      if (krmRes.error) throw krmRes.error;
      setList((krmRes.data as PengirimanRow[]) || []);
      setKendalaList((kdlRes.data as LaporanKendalaRow[]) || []);
      setTransaksiList((trxRes.data as unknown as TransaksiLookup[]) || []);
      const drivers = (drvRes.data as PengirimLookup[]) || [];
      setPengirimList(drivers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pengiriman"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Matikan stream kamera saat modal ditutup
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    if (!selectedItem) {
      stopCameraStream();
    }
  }, [selectedItem, stopCameraStream]);

  // Buka Kamera Langsung (WebRTC getUserMedia)
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback ke input file capture kamera native (HP/tablet)
        cameraInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setCameraError(
        "Akses kamera browser ditolak atau tidak tersedia. Membuka pemilih kamera/file perangkat..."
      );
      cameraInputRef.current?.click();
    }
  };

  // Jepret Foto dari Video Stream Kamera ke Canvas Terkompresi
  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const maxDim = 900;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      setFotoDataUrl(dataUrl);
      setFotoFileName(`kamera-bukti-${Date.now()}.jpg`);
      setFotoMimeType("image/jpeg");
    }
    stopCameraStream();
  };

  // Proses File Foto yang Diupload dari Perangkat (Validasi MIME & Ukuran <= 5MB sesuai D15 + Kompresi)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCameraError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setCameraError("Format foto harus berupa JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCameraError("Ukuran file foto maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 900;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setFotoDataUrl(compressedDataUrl);
          setFotoFileName(file.name);
          setFotoMimeType(file.type || "image/jpeg");
        }
      };
      img.src = String(ev.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const openActionModal = (
    item: PengirimanRow,
    mode: "diterima" | "retur" | "kendala"
  ) => {
    setSelectedItem(item);
    setUpdateMode(mode);
    setNamaPenerimaAktual(
      item.nama_penerima_aktual || item.detail_penerima || ""
    );
    setAlasanReturText(item.alasan_retur || "");
    setFotoDataUrl(
      item.foto_bukti_url?.startsWith("data:image") ||
        item.foto_bukti_url?.startsWith("http")
        ? item.foto_bukti_url
        : null
    );
    setFotoFileName(item.foto_bukti_nama || "");
    setFotoMimeType(item.foto_bukti_mime || "image/jpeg");
    setCameraError(null);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        transaksi_id: newForm.transaksi_id || null,
        pengirim_id: newForm.pengirim_id || pengirimList[0]?.id || null,
        detail_penerima: newForm.detail_penerima.trim(),
        alamat_tujuan: newForm.alamat_tujuan.trim(),
        status: "belum_dikirim" as StatusPengiriman,
        tanggal_penugasan: new Date().toISOString(),
      };
      const { error: insErr } = await supabase
        .from("pengiriman")
        .insert(payload);
      if (insErr) throw insErr;

      await logAktivitas({
        modul: "Pengiriman",
        aktivitas: `Menugaskan pengiriman baru ke ${payload.detail_penerima}`,
        dataSesudah: payload,
      });

      setShowNewModal(false);
      setNewForm({
        transaksi_id: "",
        pengirim_id: pengirimList[0]?.id || "",
        detail_penerima: "",
        alamat_tujuan: "",
      });
      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pengiriman");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMulaiKirim = async (item: PengirimanRow) => {
    try {
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
      await fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui status");
    }
  };

  const handleUpdateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    setError(null);

    try {
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
        const { error: kdlErr } = await supabase
          .from("laporan_kendala")
          .insert({
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

      stopCameraStream();
      setSelectedItem(null);
      setFotoDataUrl(null);
      setFotoFileName("");
      setAlasanReturText("");
      await fetchDeliveries();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan pembaruan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = list.filter((item) => {
    const matchStatus =
      filterStatus === "SEMUA" || item.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      (item.detail_penerima || "").toLowerCase().includes(q) ||
      item.alamat_tujuan.toLowerCase().includes(q) ||
      (item.alasan_retur || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Manajemen Pengiriman Barang & Laporan Kendala
          </h1>
          <p className="text-sm text-gray-500">
            Penugasan kurir/armada toko, ambil foto kamera / upload bukti serah
            terima, retur, dan laporan kendala lapangan
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Buat Penugasan Pengiriman</span>
        </Button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Penugasan</p>
          <p className="text-xl font-bold text-gray-900">{list.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Menunggu / Belum Dikirim</p>
          <p className="text-xl font-bold text-amber-600">
            {list.filter((i) => i.status === "belum_dikirim").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Sedang Dalam Perjalanan</p>
          <p className="text-xl font-bold text-blue-600">
            {list.filter((i) => i.status === "sedang_dikirim").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Terkirim / Diterima</p>
          <p className="text-xl font-bold text-emerald-600">
            {list.filter((i) => i.status === "diterima").length}
          </p>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField
          placeholder="Cari nama penerima, nomor nota, atau alamat tujuan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md flex-1"
        />
        <div className="flex items-center gap-1.5">
          {[
            { id: "SEMUA", label: "Semua" },
            { id: "belum_dikirim", label: "Belum Dikirim" },
            { id: "sedang_dikirim", label: "Sedang Dikirim" },
            { id: "diterima", label: "Diterima" },
            { id: "gagal", label: "Retur / Gagal" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                filterStatus === s.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs underline font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Tabel Pengiriman */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penugasan & Status Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Memuat daftar pengiriman...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Waktu Penugasan</th>
                    <th className="py-3 px-4">Penerima & Nota</th>
                    <th className="py-3 px-4">Alamat Tujuan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Foto Bukti / Catatan</th>
                    <th className="py-3 px-4 text-center">
                      Tindakan Kurir / Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filtered.map((item) => {
                    const isImageData =
                      item.foto_bukti_url?.startsWith("data:image") ||
                      item.foto_bukti_url?.startsWith("http");

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(item.tanggal_penugasan).toLocaleString(
                            "id-ID",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">
                            {item.detail_penerima || "Pelanggan"}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {item.transaksi_id && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-semibold">
                                Nota:{" "}
                                {transaksiList.find(
                                  (t) => t.id === item.transaksi_id
                                )?.no_nota || item.transaksi_id.slice(0, 8)}
                              </span>
                            )}
                            {item.pengirim_id && (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-medium">
                                Kurir:{" "}
                                {pengirimList.find(
                                  (d) => d.id === item.pengirim_id
                                )?.nama || "Petugas Pengirim"}
                              </span>
                            )}
                          </div>
                          {item.nama_penerima_aktual && (
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              Diterima oleh: {item.nama_penerima_aktual}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600">
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{item.alamat_tujuan}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                              item.status === "diterima"
                                ? "bg-emerald-50 text-emerald-700"
                                : item.status === "sedang_dikirim"
                                  ? "bg-blue-50 text-blue-700"
                                  : item.status === "gagal"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <div className="flex flex-col gap-1.5">
                            {item.foto_bukti_url && (
                              <div className="flex items-center gap-2">
                                {isImageData ? (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewItem(item)}
                                    className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition cursor-pointer"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={item.foto_bukti_url}
                                      alt="Bukti"
                                      className="w-7 h-7 rounded object-cover border border-emerald-300"
                                    />
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Lihat Foto Bukti</span>
                                  </button>
                                ) : (
                                  <span className="text-emerald-700 font-medium">
                                    File: {item.foto_bukti_nama || item.foto_bukti_url}
                                  </span>
                                )}
                              </div>
                            )}
                            {item.alasan_retur && (
                              <div className="text-red-600 font-medium">
                                {item.alasan_retur}
                              </div>
                            )}
                            {!item.foto_bukti_url && !item.alasan_retur && (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {item.status === "belum_dikirim" && (
                              <Button
                                size="sm"
                                onClick={() => handleMulaiKirim(item)}
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Berangkat Kirim</span>
                              </Button>
                            )}
                            {item.status !== "diterima" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    openActionModal(item, "diterima")
                                  }
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Terima & Bukti</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    openActionModal(item, "kendala")
                                  }
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Kendala</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openActionModal(item, "retur")}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                                  <span>Retur</span>
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  openActionModal(item, "diterima")
                                }
                              >
                                <Camera className="w-3.5 h-3.5 text-blue-600" />
                                <span>Ubah Foto Bukti</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabel Laporan Kendala Pengiriman (Sesuai Class Diagram: LaporanKendala) */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Laporan Kendala Pengiriman ({kendalaList.length} Laporan)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {kendalaList.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              Belum ada laporan kendala pengiriman tercatat.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-2.5 px-4">Waktu Lapor</th>
                    <th className="py-2.5 px-4">Penugasan Pengiriman</th>
                    <th className="py-2.5 px-4">Jenis Kendala</th>
                    <th className="py-2.5 px-4">Deskripsi Kendala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {kendalaList.map((k) => {
                    const krm = list.find((l) => l.id === k.pengiriman_id);
                    return (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(k.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-gray-900">
                          {krm?.detail_penerima || k.pengiriman_id.slice(0, 8)}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {k.jenis_kendala}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-gray-700">
                          {k.deskripsi}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL BUAT PENUGASAN BARU (+buatPenugasan() sesuai Class Diagram) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Buat Penugasan Pengiriman Baru
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreateDelivery}
              className="flex flex-col gap-3"
            >
              <div>
                <Label>Pilih Nota Transaksi (transaksi_id)</Label>
                <select
                  value={newForm.transaksi_id}
                  onChange={(e) => {
                    const trxId = e.target.value;
                    const trx = transaksiList.find((t) => t.id === trxId);
                    setNewForm({
                      ...newForm,
                      transaksi_id: trxId,
                      detail_penerima: trx
                        ? `${trx.pelanggan?.nama || "Pelanggan"} (${trx.no_nota})`
                        : newForm.detail_penerima,
                      alamat_tujuan:
                        trx?.pelanggan?.alamat || newForm.alamat_tujuan,
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  <option value="">-- Pilih Nota Transaksi (Opsional) --</option>
                  {transaksiList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.no_nota} — {t.pelanggan?.nama || "Pelanggan Umum"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Tugaskan Petugas Pengirim / Driver (pengirim_id)</Label>
                <select
                  value={newForm.pengirim_id || pengirimList[0]?.id || ""}
                  onChange={(e) =>
                    setNewForm({ ...newForm, pengirim_id: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-white"
                >
                  {pengirimList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama} (@{d.username})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Nama Penerima & Referensi Nota</Label>
                <Input
                  placeholder="Contoh: PT Maju Jaya (INV-20261110-001)"
                  value={newForm.detail_penerima}
                  onChange={(e) =>
                    setNewForm({ ...newForm, detail_penerima: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Alamat Tujuan Pengiriman</Label>
                <Input
                  placeholder="Jl. Raya Industri No. 45..."
                  value={newForm.alamat_tujuan}
                  onChange={(e) =>
                    setNewForm({ ...newForm, alamat_tujuan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  Simpan Penugasan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI DITERIMA / AMBIL FOTO KAMERA / UPLOAD FILE */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {updateMode === "diterima"
                  ? "Konfirmasi Barang Diterima & Unggah Bukti"
                  : updateMode === "retur"
                    ? "Catat Retur Pengiriman"
                    : "Laporkan Kendala Pengiriman"}
              </h3>
              <button
                onClick={() => {
                  stopCameraStream();
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAction} className="flex flex-col gap-4">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs flex flex-col gap-1">
                <p className="text-gray-600">
                  Tujuan / Nota:{" "}
                  <strong className="text-gray-900">
                    {selectedItem.detail_penerima}
                  </strong>
                </p>
                <p className="text-gray-500">
                  Alamat: {selectedItem.alamat_tujuan}
                </p>
              </div>

              {updateMode === "diterima" && (
                <div>
                  <Label>Nama Penerima Barang di Lokasi</Label>
                  <Input
                    placeholder="Contoh: Pak Mandor Agus / Ibu Sari"
                    value={namaPenerimaAktual}
                    onChange={(e) => setNamaPenerimaAktual(e.target.value)}
                    required
                  />
                </div>
              )}

              {updateMode !== "diterima" && (
                <>
                  {updateMode === "kendala" && (
                    <div>
                      <Label>Jenis Kendala Pengiriman (jenis_kendala)</Label>
                      <select
                        value={jenisKendala}
                        onChange={(e) => setJenisKendala(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-white"
                      >
                        <option value="Kendala Akses / Alamat">
                          Kendala Akses / Alamat
                        </option>
                        <option value="Kendala Armada / Kendaraan">
                          Kendala Armada / Kendaraan
                        </option>
                        <option value="Penerima Tidak di Lokasi">
                          Penerima Tidak di Lokasi
                        </option>
                        <option value="Cuaca Buruk / Banjir">
                          Cuaca Buruk / Banjir
                        </option>
                        <option value="Barang Kurang / Rusak">
                          Barang Kurang / Rusak
                        </option>
                      </select>
                    </div>
                  )}
                  <div>
                    <Label>
                      {updateMode === "retur"
                        ? "Alasan Retur Barang (Wajib)"
                        : "Deskripsi Kendala di Lapangan (Wajib)"}
                    </Label>
                    <Input
                      placeholder={
                        updateMode === "retur"
                          ? "Contoh: Spesifikasi tidak sesuai pesanan"
                          : "Contoh: Ban armada bocor / lokasi proyek tutup sementara"
                      }
                      value={alasanReturText}
                      onChange={(e) => setAlasanReturText(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {/* Bagian Ambil Foto Kamera atau Upload dari Perangkat */}
              <div className="flex flex-col gap-2.5">
                <Label>
                  {updateMode === "diterima"
                    ? "Foto Bukti Penerimaan Barang (Wajib - Kamera / Upload Perangkat)"
                    : "Foto Pendukung Kendala / Retur (Opsional)"}
                </Label>

                {/* Hidden File Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Dua Tombol Utama: Ambil Foto Kamera vs Upload dari Perangkat */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>Ambil Foto (Kamera)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Upload dari Perangkat</span>
                  </button>
                </div>

                {cameraError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
                    {cameraError}
                  </p>
                )}

                {/* Tampilan Live Viewfinder Kamera jika sedang aktif */}
                {cameraActive && (
                  <div className="relative rounded-xl overflow-hidden bg-black border border-gray-300 flex flex-col items-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full max-h-64 object-cover"
                    />
                    <div className="flex items-center justify-center gap-2 w-full p-2.5 bg-gray-900/90">
                      <Button
                        type="button"
                        size="sm"
                        onClick={capturePhotoFromVideo}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Jepret Foto Sekarang</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={stopCameraStream}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pratinjau Foto yang Sudah Diambil / Diupload */}
                {fotoDataUrl && !cameraActive ? (
                  <div className="border border-emerald-300 bg-emerald-50/30 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-800 truncate">
                        ✓ {fotoFileName || "foto-bukti-serah-terima.jpg"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFotoDataUrl(null);
                          setFotoFileName("");
                        }}
                        className="flex items-center gap-1 text-xs text-red-600 hover:underline font-medium cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus / Ulangi</span>
                      </button>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fotoDataUrl}
                      alt="Pratinjau Bukti Penerimaan"
                      className="w-full max-h-60 object-contain rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                ) : (
                  !cameraActive && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center flex flex-col items-center gap-1.5 cursor-pointer bg-gray-50/50 transition"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-xs font-medium text-gray-600">
                        Belum ada foto dipilih. Klik{" "}
                        <span className="text-blue-600 font-bold">
                          Ambil Foto (Kamera)
                        </span>{" "}
                        atau{" "}
                        <span className="text-emerald-600 font-bold">
                          Upload dari Perangkat
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Mendukung format JPG, PNG, WebP (Maks. 5 MB)
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    stopCameraStream();
                    setSelectedItem(null);
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan ke Database..." : "Simpan Pembaruan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LIHAT FOTO BUKTI UKURAN PENUH */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2.5">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Bukti Foto Penerimaan Barang
                </h3>
                <p className="text-xs text-gray-500">
                  {previewItem.detail_penerima}{" "}
                  {previewItem.nama_penerima_aktual
                    ? `• Diterima oleh: ${previewItem.nama_penerima_aktual}`
                    : ""}
                </p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewItem.foto_bukti_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewItem.foto_bukti_url}
                alt="Foto Bukti Penerimaan"
                className="w-full max-h-[70vh] object-contain rounded-xl bg-gray-100 border border-gray-200"
              />
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <span>
                Nama File: {previewItem.foto_bukti_nama || "foto-bukti.jpg"}
              </span>
              {previewItem.tanggal_terima && (
                <span>
                  Waktu Terima:{" "}
                  {new Date(previewItem.tanggal_terima).toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
