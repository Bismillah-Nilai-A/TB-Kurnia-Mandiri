"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  CustomSelect,
} from "@/components/ui";
import {
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
} from "lucide-react";
import type { JenisPembayaran } from "@/lib/types";
import {
  type PelangganRow,
  type CartItem,
  getHargaModal,
  getEffectivePrice,
  isNegoInvalid,
} from "../layanan-transaksi";

interface KeranjangPosProps {
  cart: CartItem[];
  updateCartQty: (barangId: string, delta: number) => void;
  removeFromCart: (barangId: string) => void;
  updateCartNego: (barangId: string, val: string) => void;
  handleCheckoutPOS: (e: React.FormEvent) => void;
  selectedPelangganId: string;
  setSelectedPelangganId: (val: string) => void;
  pelangganList: PelangganRow[];
  jenisPembayaran: JenisPembayaran;
  setJenisPembayaran: (val: JenisPembayaran) => void;
  uangDiterima: string;
  setUangDiterima: (val: string) => void;
  kembalian: number;
  perluDikirim: boolean;
  setPerluDikirim: (val: boolean) => void;
  alamatKirim: string;
  setAlamatKirim: (val: string) => void;
  cartTotal: number;
  submitting: boolean;
  hasAnyInvalidNego: boolean;
}

export function KeranjangPos({
  cart,
  updateCartQty,
  removeFromCart,
  updateCartNego,
  handleCheckoutPOS,
  selectedPelangganId,
  setSelectedPelangganId,
  pelangganList,
  jenisPembayaran,
  setJenisPembayaran,
  uangDiterima,
  setUangDiterima,
  kembalian,
  perluDikirim,
  setPerluDikirim,
  alamatKirim,
  setAlamatKirim,
  cartTotal,
  submitting,
  hasAnyInvalidNego,
}: KeranjangPosProps) {
  return (
    <div className="lg:col-span-5 flex flex-col">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b border-gray-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Keranjang Belanja</CardTitle>
            <span className="text-xs font-semibold text-[#1D4ED8] bg-[#EFF6FF] px-2.5 py-1 rounded-md">
              {cart.reduce((s, c) => s + c.jumlah, 0)} Barang
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between gap-3 pt-4">
          {/* Daftar Item di Keranjang */}
          {cart.length === 0 ? (
            <div className="py-6 px-3 text-center text-xs text-gray-500 border border-dashed border-gray-200 rounded-lg">
              Belum ada barang dipilih. Klik barang di sebelah kiri untuk
              menambahkan ke nota.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {cart.map((c) => {
                const hargaNormal = Number(c.barang.harga);
                const hargaModal = getHargaModal(c.barang);
                const hargaFinal = getEffectivePrice(c);
                const invalidNego = isNegoInvalid(c);
                const adaNego = c.hargaNego.trim() !== "";

                return (
                  <div
                    key={c.barang.id}
                    className={`flex flex-col gap-2 p-3 rounded-lg border ${
                      invalidNego
                        ? "bg-red-50/60 border-red-300"
                        : adaNego
                          ? "bg-emerald-50/40 border-emerald-300"
                          : "bg-[#F8FAFC] border-[#E2E8F0]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {c.barang.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rp {hargaNormal.toLocaleString("id-ID")} (Min: Rp{" "}
                          {hargaModal.toLocaleString("id-ID")})
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah"
                          onClick={() => updateCartQty(c.barang.id, -1)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold">
                          {c.jumlah}
                        </span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah"
                          onClick={() => updateCartQty(c.barang.id, 1)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded bg-white border border-gray-200 hover:bg-gray-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus dari keranjang"
                          onClick={() => removeFromCart(c.barang.id)}
                          className="h-8 w-8 inline-flex items-center justify-center text-red-600 hover:bg-red-50 rounded ml-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Input Harga Nego / Tawar per Satuan */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-gray-200/60">
                      <div className="flex items-center gap-1.5 flex-1">
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          Harga Nego:
                        </span>
                        <input
                          type="number"
                          min={hargaModal}
                          aria-label={`Harga nego ${c.barang.nama}`}
                          placeholder={`${hargaNormal}`}
                          value={c.hargaNego}
                          onChange={(e) =>
                            updateCartNego(c.barang.id, e.target.value)
                          }
                          className={`h-8 px-2 rounded border text-xs w-28 bg-white font-semibold ${
                            invalidNego
                              ? "border-red-500 text-red-700"
                              : "border-gray-300 text-gray-900"
                          }`}
                        />
                        {adaNego && (
                          <button
                            type="button"
                            onClick={() => updateCartNego(c.barang.id, "")}
                            className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        Rp {(hargaFinal * c.jumlah).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {invalidNego && (
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Minimal Rp {hargaModal.toLocaleString("id-ID")}
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Checkout */}
          <form
            onSubmit={handleCheckoutPOS}
            className="flex flex-col gap-3 pt-3 border-t border-gray-200 mt-auto"
          >
            <div>
              <Label>Pelanggan</Label>
              <CustomSelect
                value={selectedPelangganId}
                onChange={(e) => setSelectedPelangganId(e.target.value)}
                aria-label="Pilih pelanggan"
                className="w-full mt-1"
              >
                {pelangganList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jenis.toUpperCase()} - Limit: Rp{" "}
                    {Number(p.batas_kasbon).toLocaleString("id-ID")})
                  </option>
                ))}
              </CustomSelect>
            </div>

            {/* Metode Pembayaran */}
            <div>
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setJenisPembayaran("tunai")}
                  className={`flex min-h-11 items-center gap-2 p-2.5 rounded-md border text-xs font-semibold cursor-pointer ${
                    jenisPembayaran === "tunai"
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJenisPembayaran("qris")}
                  className={`flex min-h-11 items-center gap-2 p-2.5 rounded-md border text-xs font-semibold cursor-pointer ${
                    jenisPembayaran === "qris"
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJenisPembayaran("va")}
                  className={`flex min-h-11 items-center gap-2 p-2.5 rounded-md border text-xs font-semibold cursor-pointer ${
                    jenisPembayaran === "va"
                      ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Virtual Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setJenisPembayaran("kasbon")}
                  className={`flex min-h-11 items-center gap-2 p-2.5 rounded-md border text-xs font-semibold cursor-pointer ${
                    jenisPembayaran === "kasbon"
                      ? "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E]"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Kasbon</span>
                </button>
              </div>
            </div>

            {/* Input Uang Diterima (Khusus Tunai) */}
            {jenisPembayaran === "tunai" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-md border border-[#E2E8F0]">
                <div>
                  <Label>Uang Diterima (Rp)</Label>
                  <Input
                    type="number"
                    placeholder={String(cartTotal)}
                    value={uangDiterima}
                    onChange={(e) => setUangDiterima(e.target.value)}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-xs text-gray-500">Uang Kembalian</span>
                  <span className="text-base font-bold text-[#16A34A]">
                    Rp {kembalian.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            {/* Opsi Pengiriman Barang */}
            <div className="p-3 rounded-md border border-[#E2E8F0] flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={perluDikirim}
                  onChange={(e) => setPerluDikirim(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Truck className="w-4 h-4 text-[#2563EB]" />
                <span>Kirim ke Alamat Pelanggan</span>
              </label>
              {perluDikirim && (
                <Input
                  placeholder="Alamat pengiriman lengkap..."
                  value={alamatKirim}
                  onChange={(e) => setAlamatKirim(e.target.value)}
                />
              )}
            </div>

            {/* Ringkasan Total */}
            <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-[#64748B]">
                  Total Tagihan
                </span>
                <span className="text-2xl font-bold text-[#1E293B]">
                  Rp {cartTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitting || cart.length === 0 || hasAnyInvalidNego}
                className="w-full"
              >
                {submitting ? "Memproses..." : "Bayar & Cetak Struk"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
