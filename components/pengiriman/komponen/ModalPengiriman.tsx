"use client";

import type { RefObject } from "react";
import { Button, Input, Label, CustomSelect } from "@/components/ui";
import { X, Camera, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import type {
  PengirimanRow,
  TransaksiLookup,
  PengirimLookup,
  UpdatePengirimanMode,
  NewPengirimanFormState,
} from "../layanan-pengiriman";

interface ModalPengirimanProps {
  submitting: boolean;
  showNewModal: boolean;
  setShowNewModal: (val: boolean) => void;
  newForm: NewPengirimanFormState;
  setNewForm: (val: NewPengirimanFormState) => void;
  transaksiList: TransaksiLookup[];
  pengirimList: PengirimLookup[];
  onCreateDelivery: (e: React.FormEvent) => void;
  selectedItem: PengirimanRow | null;
  setSelectedItem: (val: PengirimanRow | null) => void;
  updateMode: UpdatePengirimanMode;
  namaPenerimaAktual: string;
  setNamaPenerimaAktual: (val: string) => void;
  jenisKendala: string;
  setJenisKendala: (val: string) => void;
  alasanReturText: string;
  setAlasanReturText: (val: string) => void;
  fotoDataUrl: string | null;
  setFotoDataUrl: (val: string | null) => void;
  fotoFileName: string;
  setFotoFileName: (val: string) => void;
  cameraActive: boolean;
  cameraError: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onCapturePhoto: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateAction: (e: React.FormEvent) => void;
  previewItem: PengirimanRow | null;
  setPreviewItem: (val: PengirimanRow | null) => void;
}

export function ModalPengiriman({
  submitting,
  showNewModal,
  setShowNewModal,
  newForm,
  setNewForm,
  transaksiList,
  pengirimList,
  onCreateDelivery,
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
  onStartCamera,
  onStopCamera,
  onCapturePhoto,
  onFileUpload,
  onUpdateAction,
  previewItem,
  setPreviewItem,
}: ModalPengirimanProps) {
  return (
    <>
      {/* MODAL BUAT PENUGASAN BARU */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Buat Penugasan Pengiriman
              </h3>
              <button
                type="button"
                aria-label="Tutup modal"
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={onCreateDelivery}
              className="flex flex-col gap-3"
            >
              <div>
                <Label>Nota Transaksi</Label>
                <CustomSelect
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
                  aria-label="Pilih nota transaksi"
                  className="w-full mt-1"
                >
                  <option value="">Pilih Nota Transaksi (Opsional)</option>
                  {transaksiList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.no_nota} - {t.pelanggan?.nama || "Pelanggan Umum"}
                    </option>
                  ))}
                </CustomSelect>
              </div>
              <div>
                <Label>Petugas Pengirim</Label>
                <CustomSelect
                  value={newForm.pengirim_id || pengirimList[0]?.id || ""}
                  onChange={(e) =>
                    setNewForm({ ...newForm, pengirim_id: e.target.value })
                  }
                  aria-label="Pilih petugas pengirim"
                  className="w-full mt-1"
                >
                  {pengirimList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama} (@{d.username})
                    </option>
                  ))}
                </CustomSelect>
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
                  onStopCamera();
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onUpdateAction} className="flex flex-col gap-4">
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
                      <Label>Jenis Kendala Pengiriman</Label>
                      <CustomSelect
                        value={jenisKendala}
                        onChange={(e) => setJenisKendala(e.target.value)}
                        aria-label="Jenis kendala pengiriman"
                        className="w-full mt-1"
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
                      </CustomSelect>
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
                  onChange={onFileUpload}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileUpload}
                  className="hidden"
                />

                {/* Dua Tombol Utama: Ambil Foto Kamera vs Upload dari Perangkat */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={onStartCamera}
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
                        onClick={onCapturePhoto}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Jepret Foto Sekarang</span>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={onStopCamera}
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
                      <p className="text-xs text-gray-400">
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
                    onStopCamera();
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
    </>
  );
}
