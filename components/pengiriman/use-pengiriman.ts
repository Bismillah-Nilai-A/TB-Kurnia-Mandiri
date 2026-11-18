"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  type PengirimanRow,
  type LaporanKendalaRow,
  type TransaksiLookup,
  type PengirimLookup,
  type UpdatePengirimanMode,
  type NewPengirimanFormState,
  DEFAULT_NEW_PENGIRIMAN_FORM,
  compressCanvasFromSource,
  compressImageToDataUrl,
  fetchAllPengirimanData,
  createDeliveryDB,
  mulaiKirimDB,
  updateDeliveryActionDB,
} from "./layanan-pengiriman";

export function usePengiriman() {
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
  const [newForm, setNewForm] = useState<NewPengirimanFormState>(
    DEFAULT_NEW_PENGIRIMAN_FORM
  );

  // Modal Update Status / Upload Bukti / Retur / Laporan Kendala
  const [selectedItem, setSelectedItem] = useState<PengirimanRow | null>(null);
  const [updateMode, setUpdateMode] =
    useState<UpdatePengirimanMode>("diterima");
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

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllPengirimanData();
      setList(data.list);
      setKendalaList(data.kendalaList);
      setTransaksiList(data.transaksiList);
      setPengirimList(data.pengirimList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat data pengiriman"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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
  const startCameraStream = async () => {
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
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const dataUrl = compressCanvasFromSource(video, w, h, 900);
    if (dataUrl) {
      setFotoDataUrl(dataUrl);
      setFotoFileName(`kamera-bukti-${Date.now()}.jpg`);
      setFotoMimeType("image/jpeg");
    }
    stopCameraStream();
  };

  // Proses File Foto yang Diupload dari Perangkat (Validasi MIME & Ukuran <= 5MB sesuai D15 + Kompresi)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setFotoDataUrl(compressedDataUrl);
      setFotoFileName(file.name);
      setFotoMimeType(file.type || "image/jpeg");
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : "Gagal memproses foto."
      );
    }
  };

  const openActionModal = (
    item: PengirimanRow,
    mode: UpdatePengirimanMode
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
      await createDeliveryDB(newForm, pengirimList[0]?.id);

      setShowNewModal(false);
      setNewForm({
        transaksi_id: "",
        pengirim_id: pengirimList[0]?.id || "",
        detail_penerima: "",
        alamat_tujuan: "",
      });
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pengiriman");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMulaiKirim = async (item: PengirimanRow) => {
    try {
      await mulaiKirimDB(item);
      await fetchAllData();
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
      await updateDeliveryActionDB({
        selectedItem,
        updateMode,
        namaPenerimaAktual,
        jenisKendala,
        alasanReturText,
        fotoDataUrl,
        fotoFileName,
        fotoMimeType,
      });

      stopCameraStream();
      setSelectedItem(null);
      setFotoDataUrl(null);
      setFotoFileName("");
      setAlasanReturText("");
      await fetchAllData();
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

  return {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    list,
    kendalaList,
    transaksiList,
    pengirimList,
    loading,
    error,
    setError,
    submitting,
    showNewModal,
    setShowNewModal,
    newForm,
    setNewForm,
    selectedItem,
    setSelectedItem,
    updateMode,
    setUpdateMode,
    namaPenerimaAktual,
    setNamaPenerimaAktual,
    jenisKendala,
    setJenisKendala,
    alasanReturText,
    setAlasanReturText,
    fotoDataUrl,
    setFotoDataUrl,
    fotoFileName,
    setFotoFileName,
    fotoMimeType,
    setFotoMimeType,
    cameraActive,
    cameraError,
    videoRef,
    streamRef,
    fileInputRef,
    cameraInputRef,
    previewItem,
    setPreviewItem,
    filtered,
    fetchAllData,
    startCameraStream,
    stopCameraStream,
    capturePhotoFromVideo,
    handleFileUpload,
    openActionModal,
    handleCreateDelivery,
    handleMulaiKirim,
    handleUpdateAction,
  };
}
