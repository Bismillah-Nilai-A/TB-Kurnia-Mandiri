"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button, ResponsiveTabs } from "@/components/ui";
import { Plus, AlertCircle, Banknote, Users, Clock } from "lucide-react";
import { usePiutang } from "./use-piutang";
import { TabelTagihanPiutang } from "./komponen/TabelTagihanPiutang";
import { TabelDataPelanggan } from "./komponen/TabelDataPelanggan";
import { ModalPiutangPelanggan } from "./komponen/ModalPiutangPelanggan";

export function PiutangPage() {
  const {
    activeTab,
    setActiveTab,
    search,
    setSearch,
    pelangganList,
    tagihanList,
    kasbonList,
    loading,
    error,
    setError,
    submitting,
    bayarModal,
    setBayarModal,
    nominalBayar,
    setNominalBayar,
    metodeBayar,
    setMetodeBayar,
    buktiTransferRef,
    setBuktiTransferRef,
    kwitansiBayar,
    setKwitansiBayar,
    tolakModal,
    setTolakModal,
    alasanPenolakan,
    setAlasanPenolakan,
    showPelangganModal,
    setShowPelangganModal,
    editingPelanggan,
    pelangganForm,
    setPelangganForm,
    totalPiutangAktif,
    menungguCount,
    handleProsesPembayaranPiutang,
    handleSetujuiKasbon,
    handleTolakKasbon,
    handleSavePelanggan,
    handleDeletePelanggan,
    openTambahPelangganModal,
    openEditPelangganModal,
  } = usePiutang();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Penjualan" }, { label: "Piutang & Pelanggan" }]}
        title="Piutang & Pelanggan"
        actions={
          <Button onClick={openTambahPelangganModal}>
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </Button>
        }
      />

      {/* Ringkasan Kartu Piutang */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Total Sisa Piutang
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            Rp {totalPiutangAktif.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Menunggu Persetujuan
          </p>
          <p className="mt-1 text-xl font-bold text-amber-600">
            {menungguCount} pengajuan
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Jumlah Pelanggan
          </p>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {pelangganList.length} pelanggan
          </p>
        </div>
      </div>

      {/* Tab Navigasi Responsif (Dropdown di Mobile/Tablet, Segmented Bar di Desktop) */}
      <ResponsiveTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v)}
        aria-label="Pilih tab piutang dan pelanggan"
        options={[
          {
            id: "tagihan",
            label: `Tagihan Piutang (${tagihanList.length})`,
            icon: Banknote,
          },
          {
            id: "persetujuan",
            label: `Persetujuan Kasbon (${menungguCount})`,
            icon: Clock,
          },
          {
            id: "pelanggan",
            label: `Data Pelanggan (${pelangganList.length})`,
            icon: Users,
          },
        ]}
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

      {/* TAB 1 & TAB 2: TAGIHAN PIUTANG & PERSETUJUAN KASBON */}
      {(activeTab === "tagihan" || activeTab === "persetujuan") && (
        <TabelTagihanPiutang
          activeTab={activeTab}
          loading={loading}
          submitting={submitting}
          tagihanList={tagihanList}
          kasbonList={kasbonList}
          onOpenBayarModal={(t) => {
            setBayarModal(t);
            setNominalBayar(String(t.sisa_tagihan));
            setMetodeBayar("tunai");
          }}
          onSetujuiKasbon={handleSetujuiKasbon}
          onOpenTolakModal={(k) => {
            setTolakModal(k);
            setAlasanPenolakan("");
          }}
        />
      )}

      {/* TAB 3: MASTER DATA PELANGGAN */}
      {activeTab === "pelanggan" && (
        <TabelDataPelanggan
          search={search}
          onSearchChange={setSearch}
          pelangganList={pelangganList}
          onEditPelanggan={openEditPelangganModal}
          onDeletePelanggan={handleDeletePelanggan}
        />
      )}

      {/* MODAL PIUTANG, KASBON, PELANGGAN & KWITANSI */}
      <ModalPiutangPelanggan
        submitting={submitting}
        bayarModal={bayarModal}
        setBayarModal={setBayarModal}
        nominalBayar={nominalBayar}
        setNominalBayar={setNominalBayar}
        metodeBayar={metodeBayar}
        setMetodeBayar={setMetodeBayar}
        buktiTransferRef={buktiTransferRef}
        setBuktiTransferRef={setBuktiTransferRef}
        onProsesPembayaranPiutang={handleProsesPembayaranPiutang}
        tolakModal={tolakModal}
        setTolakModal={setTolakModal}
        alasanPenolakan={alasanPenolakan}
        setAlasanPenolakan={setAlasanPenolakan}
        onTolakKasbon={handleTolakKasbon}
        showPelangganModal={showPelangganModal}
        setShowPelangganModal={setShowPelangganModal}
        editingPelanggan={editingPelanggan}
        pelangganForm={pelangganForm}
        setPelangganForm={setPelangganForm}
        onSavePelanggan={handleSavePelanggan}
        kwitansiBayar={kwitansiBayar}
        setKwitansiBayar={setKwitansiBayar}
      />
    </div>
  );
}
export default PiutangPage;
