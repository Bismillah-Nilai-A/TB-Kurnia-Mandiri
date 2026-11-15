"use client";

import { useState, useEffect, useCallback } from "react";
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
import { supabase, logAktivitas, getCurrentUser } from "@/lib/supabase";
import {
  Plus,
  X,
  AlertCircle,
  Edit3,
  Trash2,
  Barcode,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  Printer,
  Package,
} from "lucide-react";
import type { Database } from "@/lib/types";

type BarangRow = Database["public"]["Tables"]["barang"]["Row"];

interface MutasiJoined {
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

interface RestokJoined {
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

export default function BarangPage() {
  const [activeTab, setActiveTab] = useState<"katalog" | "mutasi" | "restok">(
    "katalog"
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("SEMUA");
  const [filterStok, setFilterStok] = useState<"semua" | "menipis">("semua");
  const [items, setItems] = useState<BarangRow[]>([]);
  const [mutasiList, setMutasiList] = useState<MutasiJoined[]>([]);
  const [restokList, setRestokList] = useState<RestokJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Tambah / Edit Barang
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BarangRow | null>(null);
  const [formData, setFormData] = useState({
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
  const [mutasiForm, setMutasiForm] = useState({
    jenis: "masuk" as "masuk" | "keluar",
    barang_id: "",
    jumlah: "1",
    supplier: "",
    no_referensi: "",
    tujuan: "Penjualan / Operasional",
    keterangan: "",
  });

  // Modal Rencana Restok (STR-01..03)
  const [showRestokModal, setShowRestokModal] = useState(false);
  const [restokForm, setRestokForm] = useState({
    barang_id: "",
    restok: "20",
    target: "Restok gudang utama minggu ini",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      setItems((brgRes.data as BarangRow[]) || []);
      setMutasiList((mutRes.data as unknown as MutasiJoined[]) || []);
      setRestokList((rstRes.data as unknown as RestokJoined[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const categories = [
    "SEMUA",
    ...Array.from(new Set(items.map((item) => item.kategori))).sort(),
  ];

  const filtered = items.filter((item) => {
    const matchCategory =
      selectedCategory === "SEMUA" || item.kategori === selectedCategory;
    const matchStok =
      filterStok === "semua" || item.stok <= item.stok_min;
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

    const hargaBeliNum = Number(formData.harga_beli) || 0;
    const hargaJualNum =
      Number(formData.harga) || Math.round(hargaBeliNum * 1.3);
    const stokNum = Number(formData.stok) || 0;
    const stokAwalNum = Number(formData.stok_awal) || stokNum;

    try {
      if (editingItem) {
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
        const { error: updateErr } = await supabase
          .from("barang")
          .update(payload)
          .eq("id", editingItem.id);
        if (updateErr) throw updateErr;

        await logAktivitas({
          modul: "Barang",
          aktivitas: `Mengubah data barang ${payload.kode_barang} - ${payload.nama}`,
          dataSebelum: editingItem as unknown as Database["public"]["Tables"]["log_aktivitas"]["Row"]["data_sebelum"],
          dataSesudah: payload,
        });
      } else {
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

      setShowModal(false);
      await fetchAll();
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
      await fetchAll();
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
            mutasiForm.no_referensi ||
            `MUT-${Date.now().toString().slice(-6)}`,
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

      setShowMutasiModal(false);
      await fetchAll();
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

      setShowRestokModal(false);
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan restok");
    } finally {
      setSubmitting(false);
    }
  };

  // Ubah Status Rencana Restok (+ubahStatus() sesuai Class Diagram: RencanaRestok)
  const handleUbahStatusRestok = async (r: RestokJoined, nextStatus: string) => {
    try {
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
      await fetchAll();
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Manajemen Barang, Mutasi & Stok Gudang
          </h1>
          <p className="text-sm text-gray-500">
            Katalog Harga CV Kurnia Mandiri ({items.length} item aktif) •
            Laporan Barang Masuk/Keluar • Rencana Restok
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setMutasiForm({
                jenis: "masuk",
                barang_id: items[0]?.id || "",
                jumlah: "10",
                supplier: "",
                no_referensi: `BM-${Date.now().toString().slice(-5)}`,
                tujuan: "Gudang Utama",
                keterangan: "Barang Masuk Gudang",
              });
              setShowMutasiModal(true);
            }}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
            <span>Catat Barang Masuk / Keluar</span>
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </Button>
        </div>
      </div>

      {/* Ringkasan Gudang */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Item Katalog</p>
          <p className="text-lg font-bold text-gray-900">
            {filtered.length}{" "}
            <span className="text-xs font-normal text-gray-400">
              dari {items.length} barang
            </span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Total Unit Tersedia</p>
          <p className="text-lg font-bold text-blue-600">
            {filtered
              .reduce((acc, i) => acc + i.stok, 0)
              .toLocaleString("id-ID")}{" "}
            unit
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Nilai Stok (Harga Modal)</p>
          <p className="text-lg font-bold text-gray-800">
            Rp {totalNilaiModal.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500">Estimasi Nilai Jual (+30%)</p>
          <p className="text-lg font-bold text-emerald-600">
            Rp {totalNilaiStokJual.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("katalog")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "katalog"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Katalog & Daftar Harga ({items.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("mutasi")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "mutasi"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          <span>Mutasi Barang Masuk & Keluar ({mutasiList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("restok")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            activeTab === "restok"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>
            Stok Menipis & Rencana Restok ({lowStockItems.length} perlu perhatian)
          </span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2 text-sm text-red-700 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs underline font-medium"
          >
            Tutup
          </button>
        </div>
      )}

      {/* TAB 1: KATALOG BARANG */}
      {activeTab === "katalog" && (
        <>
          <div className="flex flex-col gap-3 print:hidden">
            <div className="flex flex-wrap items-center gap-3">
              <SearchField
                placeholder="Cari kode (A001/B001), nama barang, merk, barcode, atau keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-[260px]"
              />
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setFilterStok("semua")}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                    filterStok === "semua"
                      ? "bg-blue-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  Semua Stok
                </button>
                <button
                  onClick={() => setFilterStok("menipis")}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                    filterStok === "menipis"
                      ? "bg-red-600 text-white"
                      : "text-gray-600"
                  }`}
                >
                  Stok Menipis ({lowStockItems.length})
                </button>
              </div>
            </div>

            {/* Filter Kategori */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Card className="print:hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  Memuat data barang dari database...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase">
                        <th className="py-3 px-3">Kode</th>
                        <th className="py-3 px-3">Kategori</th>
                        <th className="py-3 px-3">Merk</th>
                        <th className="py-3 px-3">Nama Barang</th>
                        <th className="py-3 px-3">Satuan</th>
                        <th className="py-3 px-3 text-right">Harga Modal</th>
                        <th className="py-3 px-3 text-right">Harga Jual</th>
                        <th className="py-3 px-3 text-right">Stok</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {filtered.map((item) => {
                        const hargaModal =
                          Number(item.harga_beli) ||
                          Math.round(Number(item.harga) / 1.3);
                        const hargaJual = Number(item.harga);
                        const isLow = item.stok <= item.stok_min;

                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-3 font-mono text-xs font-semibold text-blue-600">
                              {item.kode_barang}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-gray-600">
                              <span className="px-2 py-0.5 bg-gray-100 rounded text-[11px] font-medium">
                                {item.kategori}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-gray-700">
                              {item.merk || "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-medium text-gray-900">
                                {item.nama}
                              </div>
                              {item.keterangan && (
                                <div className="text-[11px] text-gray-400">
                                  {item.keterangan}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-gray-600">
                              {item.satuan}
                            </td>
                            <td className="py-2.5 px-3 text-right text-gray-600 text-xs">
                              Rp {hargaModal.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold text-gray-900 text-xs">
                              Rp {hargaJual.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                              {item.stok}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isLow ? (
                                <span className="px-2 py-0.5 text-[11px] font-medium bg-red-50 text-red-600 rounded-full">
                                  Menipis (Min {item.stok_min})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full">
                                  Tersedia
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  title="Cetak Label Barcode"
                                  onClick={() => setBarcodeItem(item)}
                                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                >
                                  <Barcode className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Ubah Barang"
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Hapus Barang"
                                  onClick={() => handleDeleteBarang(item)}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
        </>
      )}

      {/* TAB 2: MUTASI BARANG MASUK & KELUAR */}
      {activeTab === "mutasi" && (
        <Card className="print:hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Buku Laporan Barang Masuk & Barang Keluar (Format Excel Gudang)
              </CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Mencatat stok sebelum, jumlah masuk/keluar, stok sesudah, harga
                satuan, dan total nilai mutasi
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setMutasiForm({
                  jenis: "masuk",
                  barang_id: items[0]?.id || "",
                  jumlah: "10",
                  supplier: "",
                  no_referensi: `BM-${Date.now().toString().slice(-5)}`,
                  tujuan: "Gudang Utama",
                  keterangan: "",
                });
                setShowMutasiModal(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Input Mutasi Baru</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">No. Referensi</th>
                    <th className="py-3 px-4">Kode & Nama Barang</th>
                    <th className="py-3 px-4 text-right">Stok Awal</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                    <th className="py-3 px-4 text-right">Stok Akhir</th>
                    <th className="py-3 px-4 text-right">Harga Satuan</th>
                    <th className="py-3 px-4 text-right">Total Nilai</th>
                    <th className="py-3 px-4">Supplier / Tujuan / Ket.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {mutasiList.map((m) => {
                    const isMasuk = m.mutasi?.jenis === "masuk";
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500">
                          {m.mutasi?.tanggal
                            ? new Date(m.mutasi.tanggal).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                              isMasuk
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {m.mutasi?.jenis || "mutasi"}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-gray-700">
                          {m.mutasi?.no_referensi || "—"}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          <span className="font-mono text-blue-600 mr-1.5">
                            {m.barang?.kode_barang}
                          </span>
                          {m.barang?.nama}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-600">
                          {m.stok_sebelum}
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-bold ${
                            isMasuk ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isMasuk ? `+${m.jumlah}` : `-${m.jumlah}`}{" "}
                          {m.barang?.satuan}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-gray-900">
                          {m.stok_sesudah}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-600">
                          Rp {Number(m.harga_satuan || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                          Rp {Number(m.total_harga || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-gray-500">
                          {m.mutasi?.supplier ||
                            m.mutasi?.tujuan ||
                            m.keterangan ||
                            "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: PERINGATAN STOK MENIPIS & RENCANA RESTOK */}
      {activeTab === "restok" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Daftar Barang Stok Menipis ({lowStockItems.length} Barang)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {lowStockItems.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  Seluruh barang berada di atas batas stok minimum.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-2.5 px-4">Kode</th>
                      <th className="py-2.5 px-4">Nama Barang</th>
                      <th className="py-2.5 px-4 text-right">Sisa Stok</th>
                      <th className="py-2.5 px-4 text-right">Min</th>
                      <th className="py-2.5 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-mono font-semibold text-blue-600">
                          {item.kode_barang}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {item.nama}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-red-600">
                          {item.stok} {item.satuan}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-500">
                          {item.stok_min}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setRestokForm({
                                barang_id: item.id,
                                restok: String(
                                  Math.max(20, item.stok_min * 3 - item.stok)
                                ),
                                target: `Pengadaan ulang ${item.nama}`,
                              });
                              setShowRestokModal(true);
                            }}
                          >
                            Rencanakan Restok
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                Daftar Rencana Restok Internal ({restokList.length})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setRestokForm({
                    barang_id: lowStockItems[0]?.id || items[0]?.id || "",
                    restok: "25",
                    target: "Pengadaan rutin mingguan",
                  });
                  setShowRestokModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Buat Rencana</span>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {restokList.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  Belum ada catatan rencana restok.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">Barang</th>
                      <th className="py-2.5 px-4 text-right">Rencana Qty</th>
                      <th className="py-2.5 px-4">Status Restok</th>
                      <th className="py-2.5 px-4">Catatan Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {restokList.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500">
                          {new Date(r.tanggal).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          <span className="font-mono text-blue-600 mr-1">
                            {r.barang?.kode_barang}
                          </span>
                          {r.barang?.nama}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                          +{r.jumlah_restok ?? r.restok} {r.barang?.satuan}
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={r.status || "direncanakan"}
                            onChange={(e) =>
                              handleUbahStatusRestok(r, e.target.value)
                            }
                            className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase ${
                              r.status === "selesai"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : r.status === "dipesan"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : r.status === "batal"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            <option value="direncanakan">Direncanakan</option>
                            <option value="dipesan">Dipesan</option>
                            <option value="selesai">Selesai</option>
                            <option value="batal">Batal</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-4 text-gray-600">
                          {r.target || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT BARANG */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                {editingItem
                  ? `Ubah Barang (${editingItem.kode_barang})`
                  : "Tambah Barang Baru"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveBarang} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kode Barang</Label>
                  <Input
                    placeholder="Contoh: A089"
                    value={formData.kode_barang}
                    onChange={(e) =>
                      setFormData({ ...formData, kode_barang: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Input
                    placeholder="Contoh: BAHAN BANGUNAN"
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Merk</Label>
                  <Input
                    placeholder="Contoh: Tiga Roda / Rucika"
                    value={formData.merk}
                    onChange={(e) =>
                      setFormData({ ...formData, merk: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Barcode (Code 128 / EAN)</Label>
                  <Input
                    placeholder="Contoh: 89970010089"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Nama Barang</Label>
                <Input
                  placeholder="Masukkan nama lengkap barang"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Harga Modal / Beli (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.harga_beli}
                    onChange={(e) => {
                      const beli = e.target.value;
                      const jualOtomatis = beli
                        ? String(Math.round(Number(beli) * 1.3))
                        : formData.harga;
                      setFormData({
                        ...formData,
                        harga_beli: beli,
                        harga: jualOtomatis,
                      });
                    }}
                    required
                  />
                </div>
                <div>
                  <Label>Harga Jual (Rp) [+30%]</Label>
                  <Input
                    type="number"
                    placeholder="65000"
                    value={formData.harga}
                    onChange={(e) =>
                      setFormData({ ...formData, harga: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Stok Saat Ini</Label>
                  <Input
                    type="number"
                    value={formData.stok}
                    onChange={(e) =>
                      setFormData({ ...formData, stok: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Stok Minimum</Label>
                  <Input
                    type="number"
                    value={formData.stok_min}
                    onChange={(e) =>
                      setFormData({ ...formData, stok_min: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Satuan</Label>
                  <Input
                    placeholder="pcs / sak / btg"
                    value={formData.satuan}
                    onChange={(e) =>
                      setFormData({ ...formData, satuan: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label>Keterangan / Spesifikasi</Label>
                <Input
                  placeholder="Contoh: 16 kg / 4 Meter / Ukuran 4 inch"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Barang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT MUTASI BARANG MASUK / KELUAR */}
      {showMutasiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Catat Barang Masuk / Barang Keluar
              </h3>
              <button
                onClick={() => setShowMutasiModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMutasi} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMutasiForm({
                      ...mutasiForm,
                      jenis: "masuk",
                      no_referensi: `BM-${Date.now().toString().slice(-5)}`,
                    })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    mutasiForm.jenis === "masuk"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  + Barang Masuk (Restok)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMutasiForm({
                      ...mutasiForm,
                      jenis: "keluar",
                      no_referensi: `BK-${Date.now().toString().slice(-5)}`,
                    })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    mutasiForm.jenis === "keluar"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  - Barang Keluar / Rusak
                </button>
              </div>

              <div>
                <Label>Pilih Barang</Label>
                <select
                  value={mutasiForm.barang_id}
                  onChange={(e) =>
                    setMutasiForm({ ...mutasiForm, barang_id: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                  required
                >
                  <option value="">-- Pilih Barang --</option>
                  {items.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kode_barang}] {b.nama} (Stok: {b.stok} {b.satuan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Jumlah Unit</Label>
                  <Input
                    type="number"
                    min={1}
                    value={mutasiForm.jumlah}
                    onChange={(e) =>
                      setMutasiForm({ ...mutasiForm, jumlah: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>No. Referensi / SJ</Label>
                  <Input
                    value={mutasiForm.no_referensi}
                    onChange={(e) =>
                      setMutasiForm({
                        ...mutasiForm,
                        no_referensi: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {mutasiForm.jenis === "masuk" ? (
                <div>
                  <Label>Nama Pemasok / Supplier (Teks Bebas - D2)</Label>
                  <Input
                    placeholder="Contoh: PT Semen Indonesia / Distributor Pipa"
                    value={mutasiForm.supplier}
                    onChange={(e) =>
                      setMutasiForm({ ...mutasiForm, supplier: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div>
                  <Label>Tujuan / Alasan Keluar</Label>
                  <Input
                    placeholder="Contoh: Pemakaian Proyek / Barang Rusak"
                    value={mutasiForm.tujuan}
                    onChange={(e) =>
                      setMutasiForm({ ...mutasiForm, tujuan: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <Label>Catatan Keterangan</Label>
                <Input
                  placeholder="Catatan tambahan mutasi stok"
                  value={mutasiForm.keterangan}
                  onChange={(e) =>
                    setMutasiForm({ ...mutasiForm, keterangan: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowMutasiModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Mutasi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RENCANA RESTOK */}
      {showRestokModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Buat Rencana Restok Barang
              </h3>
              <button
                onClick={() => setShowRestokModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRestok} className="flex flex-col gap-3">
              <div>
                <Label>Pilih Barang</Label>
                <select
                  value={restokForm.barang_id}
                  onChange={(e) =>
                    setRestokForm({ ...restokForm, barang_id: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm bg-white"
                  required
                >
                  <option value="">-- Pilih Barang --</option>
                  {items.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kode_barang}] {b.nama} (Sisa: {b.stok} / Min:{" "}
                      {b.stok_min})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Jumlah Rencana Restok</Label>
                <Input
                  type="number"
                  min={1}
                  value={restokForm.restok}
                  onChange={(e) =>
                    setRestokForm({ ...restokForm, restok: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Target / Catatan Internal</Label>
                <Input
                  placeholder="Contoh: Order minggu depan"
                  value={restokForm.target}
                  onChange={(e) =>
                    setRestokForm({ ...restokForm, target: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowRestokModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan Rencana"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK LABEL BARCODE (BRG-05) */}
      {barcodeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col items-center gap-4 print:shadow-none print:border print:border-gray-300">
            <div className="flex items-center justify-between w-full border-b pb-2 print:hidden">
              <h3 className="font-bold text-gray-900 text-sm">
                Label Barcode Barang (Code 128)
              </h3>
              <button
                onClick={() => setBarcodeItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Cetak Label */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full text-center flex flex-col items-center gap-1 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                CV KURNIA MANDIRI
              </p>
              <p className="text-sm font-bold text-gray-900 leading-snug">
                {barcodeItem.nama}
              </p>
              <p className="text-xs font-semibold text-blue-600">
                Rp {Number(barcodeItem.harga).toLocaleString("id-ID")} /{" "}
                {barcodeItem.satuan}
              </p>
              {/* Visualisasi Garis Barcode */}
              <div className="my-2 px-3 py-2 bg-white border border-gray-200 rounded flex flex-col items-center">
                <div className="flex items-center justify-center gap-[2px] h-12">
                  {(barcodeItem.barcode || barcodeItem.kode_barang)
                    .split("")
                    .flatMap((ch, idx) => {
                      const code = ch.charCodeAt(0);
                      return [
                        <span
                          key={`${idx}-a`}
                          className="bg-black h-full inline-block"
                          style={{ width: `${(code % 3) + 1}px` }}
                        />,
                        <span
                          key={`${idx}-s`}
                          className="bg-white h-full inline-block"
                          style={{ width: `${((code >> 1) % 2) + 1}px` }}
                        />,
                        <span
                          key={`${idx}-b`}
                          className="bg-black h-full inline-block"
                          style={{ width: `${((code >> 2) % 3) + 1}px` }}
                        />,
                      ];
                    })}
                </div>
                <span className="font-mono text-xs tracking-widest text-gray-800 mt-1">
                  {barcodeItem.barcode || barcodeItem.kode_barang}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">
                Kode: {barcodeItem.kode_barang} • Kategori:{" "}
                {barcodeItem.kategori}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full print:hidden">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setBarcodeItem(null)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>Cetak Label</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
