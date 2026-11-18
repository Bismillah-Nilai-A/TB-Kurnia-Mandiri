"use client";

import { Button, Input, Label, CustomSelect } from "@/components/ui";
import { X, Printer } from "lucide-react";
import type { JenisPelanggan } from "@/lib/types";
import type {
  PelangganRow,
  PiutangTransaksi,
  KasbonJoined,
  KwitansiBayarState,
  PelangganFormState,
} from "../layanan-piutang";

interface ModalPiutangPelangganProps {
  submitting: boolean;
  bayarModal: PiutangTransaksi | null;
  setBayarModal: (val: PiutangTransaksi | null) => void;
  nominalBayar: string;
  setNominalBayar: (val: string) => void;
  metodeBayar: "tunai" | "transfer";
  setMetodeBayar: (val: "tunai" | "transfer") => void;
  buktiTransferRef: string;
  setBuktiTransferRef: (val: string) => void;
  onProsesPembayaranPiutang: (e: React.FormEvent) => void;
  tolakModal: KasbonJoined | null;
  setTolakModal: (val: KasbonJoined | null) => void;
  alasanPenolakan: string;
  setAlasanPenolakan: (val: string) => void;
  onTolakKasbon: (e: React.FormEvent) => void;
  showPelangganModal: boolean;
  setShowPelangganModal: (val: boolean) => void;
  editingPelanggan: PelangganRow | null;
  pelangganForm: PelangganFormState;
  setPelangganForm: (val: PelangganFormState) => void;
  onSavePelanggan: (e: React.FormEvent) => void;
  kwitansiBayar: KwitansiBayarState | null;
  setKwitansiBayar: (val: KwitansiBayarState | null) => void;
}

export function ModalPiutangPelanggan({
  submitting,
  bayarModal,
  setBayarModal,
  nominalBayar,
  setNominalBayar,
  metodeBayar,
  setMetodeBayar,
  buktiTransferRef,
  setBuktiTransferRef,
  onProsesPembayaranPiutang,
  tolakModal,
  setTolakModal,
  alasanPenolakan,
  setAlasanPenolakan,
  onTolakKasbon,
  showPelangganModal,
  setShowPelangganModal,
  editingPelanggan,
  pelangganForm,
  setPelangganForm,
  onSavePelanggan,
  kwitansiBayar,
  setKwitansiBayar,
}: ModalPiutangPelangganProps) {
  return (
    <>
      {/* MODAL CATAT PEMBAYARAN PIUTANG (BYR-02..05) */}
      {bayarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Catat Pembayaran Piutang ({bayarModal.no_nota})
              </h3>
              <button
                onClick={() => setBayarModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={onProsesPembayaranPiutang}
              className="flex flex-col gap-3"
            >
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan:</span>
                  <span className="font-bold text-gray-900">
                    {bayarModal.pelanggan?.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Tagihan Awal:</span>
                  <span>
                    Rp {Number(bayarModal.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sisa Tagihan Saat Ini:</span>
                  <span className="font-bold text-red-600">
                    Rp {Number(bayarModal.sisa_tagihan).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div>
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("tunai")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                      metodeBayar === "tunai"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Tunai (Kasir)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodeBayar("transfer")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer ${
                      metodeBayar === "transfer"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Transfer Bank
                  </button>
                </div>
              </div>

              <div>
                <Label>Nominal Pembayaran (Rp)</Label>
                <Input
                  type="number"
                  min={1}
                  max={Number(bayarModal.sisa_tagihan)}
                  value={nominalBayar}
                  onChange={(e) => setNominalBayar(e.target.value)}
                  required
                />
              </div>

              {metodeBayar === "transfer" && (
                <div>
                  <Label>Nomor Referensi / Bukti Transfer</Label>
                  <Input
                    placeholder="Contoh: TF-BCA-998123"
                    value={buktiTransferRef}
                    onChange={(e) => setBuktiTransferRef(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setBayarModal(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan..." : "Simpan & Cetak Bukti"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TOLAK KASBON (KSB-04) */}
      {tolakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                Tolak Pengajuan Kasbon
              </h3>
              <button
                onClick={() => setTolakModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={onTolakKasbon} className="flex flex-col gap-3">
              <div>
                <Label>Alasan Penolakan (Wajib Diisi)</Label>
                <Input
                  placeholder="Contoh: Melebihi plafon kredit / tagihan sebelumnya belum lunas"
                  value={alasanPenolakan}
                  onChange={(e) => setAlasanPenolakan(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTolakModal(null)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  Tolak Kasbon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PELANGGAN */}
      {showPelangganModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900">
                {editingPelanggan
                  ? "Ubah Data Pelanggan"
                  : "Tambah Pelanggan Baru"}
              </h3>
              <button
                onClick={() => setShowPelangganModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={onSavePelanggan}
              className="flex flex-col gap-3"
            >
              <div>
                <Label>Nama Pelanggan / Perusahaan</Label>
                <Input
                  placeholder="Contoh: PT Maju Jaya Konstruksi"
                  value={pelangganForm.nama}
                  onChange={(e) =>
                    setPelangganForm({ ...pelangganForm, nama: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Jenis Pelanggan</Label>
                  <CustomSelect
                    value={pelangganForm.jenis}
                    onChange={(e) =>
                      setPelangganForm({
                        ...pelangganForm,
                        jenis: e.target.value as JenisPelanggan,
                      })
                    }
                    aria-label="Jenis pelanggan"
                    className="w-full mt-1"
                  >
                    <option value="proyek">Proyek / Kontraktor</option>
                    <option value="perorangan">Perorangan</option>
                  </CustomSelect>
                </div>
                <div>
                  <Label>No. Telepon / WA</Label>
                  <Input
                    placeholder="0812..."
                    value={pelangganForm.kontak}
                    onChange={(e) =>
                      setPelangganForm({
                        ...pelangganForm,
                        kontak: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Alamat Lengkap</Label>
                <Input
                  placeholder="Alamat proyek / rumah..."
                  value={pelangganForm.alamat}
                  onChange={(e) =>
                    setPelangganForm({
                      ...pelangganForm,
                      alamat: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Batas Maksimal Kasbon (Rp)</Label>
                <Input
                  type="number"
                  value={pelangganForm.batas_kasbon}
                  onChange={(e) =>
                    setPelangganForm({
                      ...pelangganForm,
                      batas_kasbon: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPelangganModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={submitting}>
                  Simpan Pelanggan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK BUKTI PEMBAYARAN PIUTANG (BYR-05) */}
      {kwitansiBayar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 print:shadow-none">
            <div className="font-mono text-xs border border-dashed border-gray-400 p-4 rounded flex flex-col gap-2">
              <div className="text-center border-b border-dashed pb-2">
                <p className="font-bold text-sm">CV KURNIA MANDIRI</p>
                <p className="text-xs text-gray-500">
                  BUKTI PEMBAYARAN PIUTANG / KASBON
                </p>
              </div>
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold">{kwitansiBayar.noNota}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span>{kwitansiBayar.pelanggan}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Bayar:</span>
                <span>{kwitansiBayar.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode:</span>
                <span>{kwitansiBayar.metode}</span>
              </div>
              <div className="border-t border-dashed pt-2 flex justify-between font-bold text-sm">
                <span>DIBAYAR:</span>
                <span>Rp {kwitansiBayar.nominal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Sisa Tagihan:</span>
                <span>Rp {kwitansiBayar.sisaBaru.toLocaleString("id-ID")}</span>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setKwitansiBayar(null)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
