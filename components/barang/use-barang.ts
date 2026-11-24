"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type BarangRow,
  type MutasiJoined,
  type RestokJoined,
  type PemasokRow,
  type TagihanPemasokRow,
  type FormBarangState,
  type FormMutasiState,
  type FormRestokState,
  INITIAL_KATALOG,
  INITIAL_MUTASI,
  INITIAL_RESTOK,
  INITIAL_PEMASOK,
  INITIAL_TAGIHAN_PEMASOK,
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
  const [pemasokList, setPemasokList] =
    useState<PemasokRow[]>(INITIAL_PEMASOK);
  const [tagihanPemasokList, setTagihanPemasokList] = useState<
    TagihanPemasokRow[]
  >(INITIAL_TAGIHAN_PEMASOK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Tambah / Edit Barang
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BarangRow | null>(null);
  const [formData, setFormData] = useState<FormBarangState>({
    kode_barang: "",
    nama: "",
    kategori: "Material Dasar",
    barcode: "",
    barcode_fisik: true,
    harga_beli: "",
    harga: "",
    stok: "",
    stok_min: "5",
    satuan: "Pcs",
    satuan_pembelian: "Pcs",
    isi_per_satuan_beli: "1",
  });
  const [submitting, setSubmitting] = useState(false);

  // Modal Barcode Print
  const [barcodeItem, setBarcodeItem] = useState<BarangRow | null>(null);

  // Modal Mutasi Barang Masuk / Keluar
  const [showMutasiModal, setShowMutasiModal] = useState(false);
  const [mutasiForm, setMutasiForm] = useState<FormMutasiState>({
    jenis: "masuk",
    barang_id: "",
    jumlah: "1",
    pemasok_id: "",
    supplier: "",
    no_referensi: "",
    jenis_bayar: "tunai",
    tanggal_jatuh_tempo: "",
    tujuan: "Penjualan / Operasional",
    keterangan: "",
  });

  // Modal Rencana Restok
  const [showRestokModal, setShowRestokModal] = useState(false);
  const [restokForm, setRestokForm] = useState<FormRestokState>({
    barang_id: "",
    restok: "20",
  });

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBarangData();
      setItems(data.items);
      setMutasiList(data.mutasiList);
      setRestokList(data.restokList);
      setPemasokList(data.pemasokList);
      setTagihanPemasokList(data.tagihanPemasokList);
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
    const matchStok =
      filterStok === "semua" || item.stok <= item.stok_minimum;
    const q = search.toLowerCase();
    const matchSearch =
      item.nama.toLowerCase().includes(q) ||
      item.kode_barang.toLowerCase().includes(q) ||
      item.kategori.toLowerCase().includes(q) ||
      (item.barcode || "").toLowerCase().includes(q);
    return matchCategory && matchStok && matchSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      kode_barang: `A${String(items.length + 1).padStart(3, "0")}`,
      nama: "",
      kategori: "Material Dasar",
      barcode: `8992026${String(items.length + 1).padStart(5, "0")}`,
      barcode_fisik: true,
      harga_beli: "",
      harga: "",
      stok: "20",
      stok_min: "5",
      satuan: "Pcs",
      satuan_pembelian: "Pcs",
      isi_per_satuan_beli: "1",
    });
    setShowModal(true);
  };

  const openEditModal = (item: BarangRow) => {
    setEditingItem(item);
    setFormData({
      kode_barang: item.kode_barang,
      nama: item.nama,
      kategori: item.kategori,
      barcode: item.barcode || "",
      barcode_fisik: item.barcode_fisik ?? true,
      harga_beli: String(item.harga_beli || item.harga_modal || 0),
      harga: String(item.harga || 0),
      stok: String(item.stok || 0),
      stok_min: String(item.stok_minimum || 5),
      satuan: item.satuan_dasar || "Pcs",
      satuan_pembelian: item.satuan_pembelian || item.satuan_dasar || "Pcs",
      isi_per_satuan_beli: String(item.isi_per_satuan_beli || 1),
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
    (acc, item) => acc + Number(item.harga) * Number(item.stok),
    0
  );
  const totalNilaiModal = filtered.reduce(
    (acc, item) =>
      acc +
      Number(item.harga_modal || item.harga_beli || item.harga / 1.3) *
        Number(item.stok),
    0
  );
  const lowStockItems = items.filter(
    (i) => Number(i.stok) <= Number(i.stok_minimum)
  );

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
    pemasokList,
    tagihanPemasokList,
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
