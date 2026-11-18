"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Printer, AlertCircle, ShoppingCart } from "lucide-react";
import { useTransaksi } from "./use-transaksi";
import { KatalogPos } from "./komponen/KatalogPos";
import { KeranjangPos } from "./komponen/KeranjangPos";
import { TabelRiwayatTransaksi } from "./komponen/TabelRiwayatTransaksi";
import { ModalStrukTransaksi } from "./komponen/ModalStrukTransaksi";

export function TransaksiPage() {
  const {
    mode,
    setMode,
    searchTrx,
    setSearchTrx,
    activeTab,
    setActiveTab,
    transactions,
    pelangganList,
    loading,
    error,
    setError,
    searchProduk,
    setSearchProduk,
    kategoriProduk,
    setKategoriProduk,
    cart,
    selectedPelangganId,
    setSelectedPelangganId,
    jenisPembayaran,
    setJenisPembayaran,
    uangDiterima,
    setUangDiterima,
    perluDikirim,
    setPerluDikirim,
    alamatKirim,
    setAlamatKirim,
    submitting,
    setSubmitting,
    snapModal,
    setSnapModal,
    strukTrx,
    setStrukTrx,
    addToCart,
    updateCartNego,
    updateCartQty,
    removeFromCart,
    hasAnyInvalidNego,
    cartTotal,
    kembalian,
    categories,
    filteredProducts,
    filteredTransactions,
    handleCheckoutPOS,
    finalizeTransactionToDB,
  } = useTransaksi();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Penjualan" }, { label: "Transaksi Kasir" }]}
        title="Transaksi Kasir"
        actions={
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#CBD5E1]">
            <button
              onClick={() => setMode("pos")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === "pos"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir POS Baru</span>
            </button>
            <button
              onClick={() => setMode("riwayat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === "riwayat"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Riwayat Nota ({transactions.length})</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-sm text-red-700 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs underline font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* MODE 1: KASIR POS MULTI-ITEM */}
      {mode === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pb-6 print:hidden">
          <KatalogPos
            searchProduk={searchProduk}
            setSearchProduk={setSearchProduk}
            kategoriProduk={kategoriProduk}
            setKategoriProduk={setKategoriProduk}
            categories={categories}
            loading={loading}
            filteredProducts={filteredProducts}
            cart={cart}
            addToCart={addToCart}
          />
          <KeranjangPos
            cart={cart}
            updateCartQty={updateCartQty}
            removeFromCart={removeFromCart}
            updateCartNego={updateCartNego}
            handleCheckoutPOS={handleCheckoutPOS}
            selectedPelangganId={selectedPelangganId}
            setSelectedPelangganId={setSelectedPelangganId}
            pelangganList={pelangganList}
            jenisPembayaran={jenisPembayaran}
            setJenisPembayaran={setJenisPembayaran}
            uangDiterima={uangDiterima}
            setUangDiterima={setUangDiterima}
            kembalian={kembalian}
            perluDikirim={perluDikirim}
            setPerluDikirim={setPerluDikirim}
            alamatKirim={alamatKirim}
            setAlamatKirim={setAlamatKirim}
            cartTotal={cartTotal}
            submitting={submitting}
            hasAnyInvalidNego={hasAnyInvalidNego}
          />
        </div>
      )}

      {/* MODE 2: RIWAYAT NOTA & CETAK ULANG STRUK */}
      {mode === "riwayat" && (
        <TabelRiwayatTransaksi
          searchTrx={searchTrx}
          setSearchTrx={setSearchTrx}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredTransactions={filteredTransactions}
          setStrukTrx={setStrukTrx}
        />
      )}

      <ModalStrukTransaksi
        snapModal={snapModal}
        setSnapModal={setSnapModal}
        submitting={submitting}
        setSubmitting={setSubmitting}
        finalizeTransactionToDB={finalizeTransactionToDB}
        strukTrx={strukTrx}
        setStrukTrx={setStrukTrx}
      />
    </div>
  );
}
