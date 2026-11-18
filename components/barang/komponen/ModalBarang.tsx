"use client";

import { Button, Input, Label, CustomSelect } from "@/components/ui";
import { X, Printer } from "lucide-react";
import {
  type BarangRow,
  type FormBarangState,
  type FormMutasiState,
  type FormRestokState,
  renderCode128SVG,
} from "../layanan-barang";

interface ModalBarangProps {
  items: BarangRow[];
  submitting: boolean;
  // Modal Tambah / Edit Barang
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  editingItem: BarangRow | null;
  formData: FormBarangState;
  setFormData: React.Dispatch<React.SetStateAction<FormBarangState>>;
  handleSaveBarang: (e: React.FormEvent) => Promise<void>;
  // Modal Mutasi
  showMutasiModal: boolean;
  setShowMutasiModal: (val: boolean) => void;
  mutasiForm: FormMutasiState;
  setMutasiForm: React.Dispatch<React.SetStateAction<FormMutasiState>>;
  handleSaveMutasi: (e: React.FormEvent) => Promise<void>;
  // Modal Restok
  showRestokModal: boolean;
  setShowRestokModal: (val: boolean) => void;
  restokForm: FormRestokState;
  setRestokForm: React.Dispatch<React.SetStateAction<FormRestokState>>;
  handleSaveRestok: (e: React.FormEvent) => Promise<void>;
  // Modal Barcode
  barcodeItem: BarangRow | null;
  setBarcodeItem: (item: BarangRow | null) => void;
}

export function ModalBarang({
  items,
  submitting,
  showModal,
  setShowModal,
  editingItem,
  formData,
  setFormData,
  handleSaveBarang,
  showMutasiModal,
  setShowMutasiModal,
  mutasiForm,
  setMutasiForm,
  handleSaveMutasi,
  showRestokModal,
  setShowRestokModal,
  restokForm,
  setRestokForm,
  handleSaveRestok,
  barcodeItem,
  setBarcodeItem,
}: ModalBarangProps) {
  return (
    <>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                <CustomSelect
                  value={mutasiForm.barang_id}
                  onChange={(e) =>
                    setMutasiForm({ ...mutasiForm, barang_id: e.target.value })
                  }
                  aria-label="Pilih barang mutasi"
                  className="w-full mt-1"
                >
                  <option value="">Pilih Barang</option>
                  {items.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kode_barang}] {b.nama} (Stok: {b.stok} {b.satuan})
                    </option>
                  ))}
                </CustomSelect>
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
                <CustomSelect
                  value={restokForm.barang_id}
                  onChange={(e) =>
                    setRestokForm({ ...restokForm, barang_id: e.target.value })
                  }
                  aria-label="Pilih barang restok"
                  className="w-full mt-1"
                >
                  <option value="">Pilih Barang</option>
                  {items.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.kode_barang}] {b.nama} (Sisa: {b.stok} / Min:{" "}
                      {b.stok_min})
                    </option>
                  ))}
                </CustomSelect>
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
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
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
                  {renderCode128SVG(
                    barcodeItem.barcode || barcodeItem.kode_barang
                  ).map((seg) => (
                    <span
                      key={seg.key}
                      className={`${
                        seg.color === "black" ? "bg-black" : "bg-white"
                      } h-full inline-block`}
                      style={{ width: `${seg.width}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-widest text-gray-800 mt-1">
                  {barcodeItem.barcode || barcodeItem.kode_barang}
                </span>
              </div>
              <span className="text-xs text-gray-400">
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
    </>
  );
}
