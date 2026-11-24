"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button, ResponsiveTabs } from "@/components/ui";
import {
  Plus,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ClipboardList,
  Package,
} from "lucide-react";
import { useBarang } from "./use-barang";
import { TabelKatalogBarang } from "./komponen/TabelKatalogBarang";
import { TabelMutasiBarang } from "./komponen/TabelMutasiBarang";
import { PanelRestokBarang } from "./komponen/PanelRestokBarang";
import { ModalBarang } from "./komponen/ModalBarang";

export default function BarangPage() {
  const {
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
    openAddModal,
    openEditModal,
    handleSaveBarang,
    handleDeleteBarang,
    handleSaveMutasi,
    handleSaveRestok,
    handleUbahStatusRestok,
  } = useBarang();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Persediaan" }, { label: "Barang & Stok" }]}
        title="Barang & Stok"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setMutasiForm({
                  jenis: "masuk",
                  barang_id: items[0]?.id || "",
                  jumlah: "10",
                  pemasok_id: "",
                  supplier: "",
                  no_referensi: `SJ-${Date.now().toString().slice(-5)}`,
                  jenis_bayar: "tunai",
                  tanggal_jatuh_tempo: "",
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
        }
      />

      {/* Ringkasan Gudang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 print:hidden">
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Total Barang</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {filtered.length} barang
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Total Unit</p>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {filtered
              .reduce((acc, i) => acc + i.stok, 0)
              .toLocaleString("id-ID")}{" "}
            unit
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Nilai Modal</p>
          <p className="mt-1 text-xl font-bold text-gray-800">
            Rp {totalNilaiModal.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Estimasi Nilai Jual
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            Rp {totalNilaiStokJual.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tab Navigasi Responsif (Dropdown di Mobile/Tablet, Segmented Bar di Desktop) */}
      <ResponsiveTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v)}
        aria-label="Pilih tab manajemen barang"
        options={[
          {
            id: "katalog",
            label: `Katalog & Harga (${items.length})`,
            icon: Package,
          },
          {
            id: "mutasi",
            label: `Barang Masuk & Keluar (${mutasiList.length})`,
            icon: ArrowUpCircle,
          },
          {
            id: "restok",
            label: `Stok Menipis (${lowStockItems.length})`,
            icon: ClipboardList,
          },
        ]}
      />

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
        <TabelKatalogBarang
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          filterStok={filterStok}
          setFilterStok={setFilterStok}
          lowStockCount={lowStockItems.length}
          loading={loading}
          filtered={filtered}
          setBarcodeItem={setBarcodeItem}
          openEditModal={openEditModal}
          handleDeleteBarang={handleDeleteBarang}
        />
      )}

      {/* TAB 2: MUTASI BARANG MASUK & KELUAR */}
      {activeTab === "mutasi" && (
        <TabelMutasiBarang
          mutasiList={mutasiList}
          items={items}
          setMutasiForm={setMutasiForm}
          setShowMutasiModal={setShowMutasiModal}
        />
      )}

      {/* TAB 3: PERINGATAN STOK MENIPIS & RENCANA RESTOK */}
      {activeTab === "restok" && (
        <PanelRestokBarang
          lowStockItems={lowStockItems}
          restokList={restokList}
          items={items}
          setRestokForm={setRestokForm}
          setShowRestokModal={setShowRestokModal}
          handleUbahStatusRestok={handleUbahStatusRestok}
        />
      )}

      {/* MODALS */}
      <ModalBarang
        items={items}
        submitting={submitting}
        showModal={showModal}
        setShowModal={setShowModal}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        handleSaveBarang={handleSaveBarang}
        showMutasiModal={showMutasiModal}
        setShowMutasiModal={setShowMutasiModal}
        mutasiForm={mutasiForm}
        setMutasiForm={setMutasiForm}
        handleSaveMutasi={handleSaveMutasi}
        showRestokModal={showRestokModal}
        setShowRestokModal={setShowRestokModal}
        restokForm={restokForm}
        setRestokForm={setRestokForm}
        handleSaveRestok={handleSaveRestok}
        barcodeItem={barcodeItem}
        setBarcodeItem={setBarcodeItem}
      />
    </div>
  );
}
