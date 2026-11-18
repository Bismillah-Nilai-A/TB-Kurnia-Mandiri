"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button, SearchField, ResponsiveTabs } from "@/components/ui";
import { Plus } from "lucide-react";
import { usePengiriman } from "./use-pengiriman";
import { TabelPengiriman } from "./komponen/TabelPengiriman";
import { ModalPengiriman } from "./komponen/ModalPengiriman";

export function PengirimanPage() {
  const {
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
    cameraActive,
    cameraError,
    videoRef,
    fileInputRef,
    cameraInputRef,
    previewItem,
    setPreviewItem,
    filtered,
    startCameraStream,
    stopCameraStream,
    capturePhotoFromVideo,
    handleFileUpload,
    openActionModal,
    handleCreateDelivery,
    handleMulaiKirim,
    handleUpdateAction,
  } = usePengiriman();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        crumbs={[{ label: "Penjualan" }, { label: "Pengiriman" }]}
        title="Pengiriman"
        actions={
          <Button onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            <span>Buat Penugasan</span>
          </Button>
        }
      />

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Total Penugasan</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{list.length}</p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Menunggu Dikirim
          </p>
          <p className="mt-1 text-xl font-bold text-amber-600">
            {list.filter((i) => i.status === "belum_dikirim").length}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Dalam Perjalanan
          </p>
          <p className="mt-1 text-xl font-bold text-blue-600">
            {list.filter((i) => i.status === "sedang_dikirim").length}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Selesai</p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
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
          className="max-w-md flex-1 min-w-[220px]"
        />
        <ResponsiveTabs
          value={filterStatus}
          onChange={(id) => setFilterStatus(id)}
          aria-label="Filter status pengiriman"
          options={[
            { id: "SEMUA", label: "Semua" },
            { id: "belum_dikirim", label: "Menunggu" },
            { id: "sedang_dikirim", label: "Dalam Perjalanan" },
            { id: "diterima", label: "Selesai" },
            { id: "gagal", label: "Retur / Gagal" },
          ]}
        />
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

      {/* Tabel Pengiriman & Laporan Kendala */}
      <TabelPengiriman
        loading={loading}
        list={list}
        filtered={filtered}
        kendalaList={kendalaList}
        transaksiList={transaksiList}
        pengirimList={pengirimList}
        onMulaiKirim={handleMulaiKirim}
        onOpenActionModal={openActionModal}
        onPreviewFoto={setPreviewItem}
      />

      {/* Modal Penugasan, Konfirmasi/Kamera/Upload, dan Preview Foto */}
      <ModalPengiriman
        submitting={submitting}
        showNewModal={showNewModal}
        setShowNewModal={setShowNewModal}
        newForm={newForm}
        setNewForm={setNewForm}
        transaksiList={transaksiList}
        pengirimList={pengirimList}
        onCreateDelivery={handleCreateDelivery}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        updateMode={updateMode}
        namaPenerimaAktual={namaPenerimaAktual}
        setNamaPenerimaAktual={setNamaPenerimaAktual}
        jenisKendala={jenisKendala}
        setJenisKendala={setJenisKendala}
        alasanReturText={alasanReturText}
        setAlasanReturText={setAlasanReturText}
        fotoDataUrl={fotoDataUrl}
        setFotoDataUrl={setFotoDataUrl}
        fotoFileName={fotoFileName}
        setFotoFileName={setFotoFileName}
        cameraActive={cameraActive}
        cameraError={cameraError}
        videoRef={videoRef}
        fileInputRef={fileInputRef}
        cameraInputRef={cameraInputRef}
        onStartCamera={startCameraStream}
        onStopCamera={stopCameraStream}
        onCapturePhoto={capturePhotoFromVideo}
        onFileUpload={handleFileUpload}
        onUpdateAction={handleUpdateAction}
        previewItem={previewItem}
        setPreviewItem={setPreviewItem}
      />
    </div>
  );
}
export default PengirimanPage;
