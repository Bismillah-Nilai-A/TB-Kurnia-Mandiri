"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type BarangRow,
  type MutasiJoined,
  type RestokJoined,
  type FormBarangState,
  type FormMutasiState,
  type FormRestokState,
  INITIAL_KATALOG,
  INITIAL_MUTASI,
  INITIAL_RESTOK,
  fetchAllBarangData,
  simpanBarangKeDatabase,
  hapusBarangDariDatabase,
  simpanMutasiKeDatabase,
  simpanRestokKeDatabase,
  ubahStatusRestokDiDatabase,
} from "./layanan-barang";

export function useBarang() {
  const [activeTab, setActiveTab] = useState<"katalog" | "mutasi" | "restok">(
    "katalog"
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("SEMUA");
  const [filterStok, setFilterStok] = useState<"semua" | "menipis">("semua");
  const [items, setItems] = useState<BarangRow[]>(INITIAL_KATALOG);
  const [mutasiList, setMutasiList] = useState<MutasiJoined[]>(INITIAL_MUTASI);
  const [restokList, setRestokList] = useState<RestokJoined[]>(INITIAL_RESTOK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Tambah / Edit Barang
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BarangRow | null>(null);
  const [formData, setFormData] = useState<FormBarangState>({
    kode_barang: "",
    nama: "",
    kategori: "BAHAN BANGUNAN",
    merk: "",
    barcode: "",
    harga_beli: "",
    harga: "",
    stok_awal: "",
    stok: "",
    stok_min: "5",
    satuan: "pcs",
    keterangan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Barcode Print (BRG-05)
  const [barcodeItem, setBarcodeItem] = useState<BarangRow | null>(null);

  // Modal Mutasi Barang Masuk / Keluar (MUT-01..06)
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [mutasiForm, setMutasiForm] = useState<FormMutasiState>({
    jenis: "masuk",
    barang_id: "",
    jumlah: "1",
    supplier: "",
    no_referensi: "",
    tujuan: "Penjualan / Operasional",
    keterangan: "",
  });

  // Modal Rencana Restok (STR-01..03)
  const [showRestokModal, setShowRestokModal] = useState(false);
  const [restokForm, setRestokForm] = useState<FormRestokState>({
    barang_id: "",
    restok: "20",
    target: "Restok gudang utama minggu ini",
  });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBarangData();
      setItems(data.items);
      setMutasiList(data.mutasiList);
      setRestokList(data.restokList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const categories = [
    "SEMUA",
    ...Array.from(new Set(items.map((item) => item.kategori))).sort(),
  ];

  const filtered = items.filter((item) => {
    const matchCategory =
      selectedCategory === "SEMUA" || item.kategori === selectedCategory;
    const matchStok = filterStok === "semua" || item.stok <= item.stok_min;
    const q = search.toLowerCase();
    const matchSearch =
      item.nama.toLowerCase().includes(q) ||
      item.kode_barang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      (item.merk || "").toLowerCase().includes(q) ||
      (item.barcode || "").toLowerCase().includes(q) ||
      (item.keterangan || "").toLowerCase().includes(q);
    return matchCategory && matchStok && matchSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kode_barang: `A${String(items.length + 1).padStart(3, "0")}`,
      nama: "",
      kategori: "BAHAN BANGUNAN",
      merk: "",
      barcode: `8997001${String(items.length + 1).padStart(4, "0")}`,
      harga_beli: "",
      harga: "",
      stok_awal: "20",
      stok: "20",
      stok_min: "5",
      satuan: "pcs",
      keterangan: "",
    });
    setShowModal(true);
  };

  const openEditModal = (item: BarangRow) => {
    setEditingItem(item);
    setFormData({
      kode_barang: item.kode_barang,
      nama: item.nama,
      kategori: item.kategori,
      merk: item.merk || "",
      barcode: item.barcode || "",
      harga_beli: String(item.harga_beli || 0),
      harga: String(item.harga || 0),
      stok_awal: String(item.stok_awal || item.stok || 0),
      stok: String(item.stok || 0),
      stok_min: String(item.stok_min || 5),
      satuan: item.satuan || "pcs",
      keterangan: item.keterangan || "",
    });
    setShowModal(true);
  };

  const handleSaveBarang = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await simpanBarangKeDatabase(formData, editingItem);
      setShowModal(false);
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan barang");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBarang = async (item: BarangRow) => {
    if (
      !window.confirm(
        `Hapus barang "${item.kode_barang} - ${item.nama}" dari katalog?`
      )
    )
      return;

    try {
      await hapusBarangDariDatabase(item);
      await fetchAllData();
    } catch (err) {
      setError(
        `Tidak dapat menghapus barang karena sudah memiliki riwayat transaksi/mutasi (${err instanceof Error ? err.message : ""})`
      );
    }
  };

  const handleSaveMutasi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await simpanMutasiKeDatabase(mutasiForm, items);
      setShowMutasiModal(false);
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencatat mutasi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveRestok = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await simpanRestokKeDatabase(restokForm, items);
      setShowRestokModal(false);
      await fetchAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan restok");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUbahStatusRestok = async (
    r: RestokJoined,
    nextStatus: string
  ) => {
    try {
      await ubahStatusRestokDiDatabase(r, nextStatus);
      await fetchAllData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah status restok"
      );
    }
  };

  const totalNilaiStokJual = filtered.reduce(
    (acc, item) => acc + Number(item.harga) * item.stok,
    0
  );
  const totalNilaiModal = filtered.reduce(
    (acc, item) =>
      acc + Number(item.harga_beli || item.harga * 0.75) * item.stok,
    0
  );
  const lowStockItems = items.filter((i) => i.stok <= i.stok_min);

  return {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    filterStok,
    setFilterStok,
    items,
    mutasiList,
    restokList,
    loading,
    error,
    setError,
    showModal,
    setShowModal,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    submitting,
    barcodeItem,
    setBarcodeItem,
    showMutasiModal,
    setShowMutasiModal,
    mutasiForm,
    setMutasiForm,
    showRestokModal,
    setShowRestokModal,
    restokForm,
    setRestokForm,
    categories,
    filtered,
    totalNilaiStokJual,
    totalNilaiModal,
    lowStockItems,
    fetchAllData,
    openAddModal,
    openEditModal,
    handleSaveBarang,
    handleDeleteBarang,
    handleSaveMutasi,
    handleSaveRestok,
    handleUbahStatusRestok,
  };
}
