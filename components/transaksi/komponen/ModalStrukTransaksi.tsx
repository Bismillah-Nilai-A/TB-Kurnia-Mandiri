"use client";

import { Button } from "@/components/ui";
import {
  Printer,
  X,
  QrCode,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { StatusBayar } from "@/lib/types";
import type { TransaksiRow, SnapModalState } from "../layanan-transaksi";

interface ModalStrukTransaksiProps {
  snapModal: SnapModalState | null;
  setSnapModal: (val: SnapModalState | null) => void;
  submitting: boolean;
  setSubmitting: (val: boolean) => void;
  finalizeTransactionToDB: (params: {
    noNota: string;
    statusBayar: StatusBayar;
    jumlahDibayar: number;
    sisaTagihan: number;
    refGateway?: string;
  }) => Promise<void>;
  strukTrx: TransaksiRow | null;
  setStrukTrx: (val: TransaksiRow | null) => void;
}

export function ModalStrukTransaksi({
  snapModal,
  setSnapModal,
  submitting,
  setSubmitting,
  finalizeTransactionToDB,
  strukTrx,
  setStrukTrx,
}: ModalStrukTransaksiProps) {
  return (
    <>
      {/* MODAL PEMBAYARAN MIDTRANS SNAP (QRIS / VIRTUAL ACCOUNT) */}
      {snapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-gray-900">
                  Pembayaran Non-Tunai Midtrans (
                  {snapModal.metode.toUpperCase()})
                </h3>
                <p className="text-xs text-gray-500">
                  Order ID: {snapModal.orderId}
                </p>
              </div>
              <button
                onClick={() => setSnapModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center flex flex-col items-center gap-2">
              <QrCode className="w-12 h-12 text-blue-600" />
              <p className="text-xs text-gray-600">Total Pembayaran</p>
              <p className="text-2xl font-bold text-blue-900">
                Rp {snapModal.total.toLocaleString("id-ID")}
              </p>
              <span className="text-xs font-mono bg-white px-2.5 py-1 rounded border border-blue-200 text-blue-700">
                Snap Token: {snapModal.token}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={snapModal.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Halaman Pembayaran Midtrans Sandbox</span>
              </a>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await finalizeTransactionToDB({
                      noNota: snapModal.orderId,
                      statusBayar: "lunas",
                      jumlahDibayar: snapModal.total,
                      sisaTagihan: 0,
                      refGateway: snapModal.token,
                    });
                    setSnapModal(null);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi Pembayaran Berhasil & Cetak Struk</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL STRUK THERMAL 80MM (TRX-10 - @media print) */}
      {strukTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 print:shadow-none print:max-w-none print:w-[80mm] print:p-2">
            {/* Tombol Tutup (Disembunyikan saat print) */}
            <div className="flex items-center justify-between border-b pb-2 print:hidden">
              <h3 className="font-bold text-gray-900 text-sm">
                Pratinjau Struk Thermal POS
              </h3>
              <button
                onClick={() => setStrukTrx(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Isi Struk Thermal */}
            <div className="font-mono text-xs text-gray-900 flex flex-col gap-2 border border-dashed border-gray-300 p-4 rounded print:border-none print:p-0">
              <div className="text-center border-b border-dashed border-gray-400 pb-2">
                <p className="font-bold text-sm">CV KURNIA MANDIRI</p>
                <p className="text-xs text-gray-600">
                  Toko Bahan & Material Bangunan
                </p>
                <p className="text-xs text-gray-500">
                  Jl. Raya Kurnia Mandiri No. 18
                </p>
              </div>

              <div className="flex flex-col gap-0.5 text-xs border-b border-dashed border-gray-400 pb-2">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{strukTrx.no_nota}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>
                    {new Date(strukTrx.tanggal).toLocaleString("id-ID", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>{strukTrx.pelanggan?.nama || "Pelanggan Umum"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="uppercase">{strukTrx.jenis_pembayaran}</span>
                </div>
              </div>

              {/* Daftar Item */}
              <div className="flex flex-col gap-1.5 border-b border-dashed border-gray-400 pb-2">
                {(strukTrx.detail_transaksi || []).map((d) => (
                  <div key={d.id} className="flex flex-col">
                    <span className="font-semibold">
                      {d.barang?.nama || "Item Barang"}
                    </span>
                    {d.harga_nego &&
                      d.harga_asli &&
                      Number(d.harga_nego) !== Number(d.harga_asli) && (
                        <span className="text-xs text-gray-500">
                          Harga Normal: Rp{" "}
                          {Number(d.harga_asli).toLocaleString("id-ID")} → Nego
                        </span>
                      )}
                    <div className="flex justify-between text-xs text-gray-700">
                      <span>
                        {d.jumlah} {d.barang?.satuan || "pcs"} x Rp{" "}
                        {Number(d.harga_satuan).toLocaleString("id-ID")}
                      </span>
                      <span>
                        Rp {Number(d.subtotal).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Status */}
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>
                    Rp {Number(strukTrx.total).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Dibayar:</span>
                  <span>
                    Rp {Number(strukTrx.jumlah_dibayar).toLocaleString("id-ID")}
                  </span>
                </div>
                {Number(strukTrx.sisa_tagihan) > 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span>Sisa Tagihan (Kasbon):</span>
                    <span>
                      Rp {Number(strukTrx.sisa_tagihan).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span>Status:</span>
                  <span className="uppercase font-bold">
                    {strukTrx.status_bayar}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-gray-400 text-xs text-gray-500">
                <p>Terima kasih atas kepercayaan Anda</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar</p>
              </div>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setStrukTrx(null)}
              >
                Tutup
              </Button>
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
