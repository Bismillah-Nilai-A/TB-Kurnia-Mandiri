"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  TablePagination,
} from "@/components/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PreviewTabLaporan } from "../layanan-laporan";

interface TabelPratinjauLaporanProps {
  previewTab: PreviewTabLaporan;
  trxRows: Array<Record<string, unknown>>;
  barangRows: Array<Record<string, unknown>>;
  mutasiRows: Array<Record<string, unknown>>;
  kasbonRows: Array<Record<string, unknown>>;
}

export function TabelPratinjauLaporan({
  previewTab,
  trxRows,
  barangRows,
  mutasiRows,
  kasbonRows,
}: TabelPratinjauLaporanProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [previewTab, trxRows.length, barangRows.length, mutasiRows.length, kasbonRows.length]);

  const activeRows =
    previewTab === "penjualan"
      ? trxRows
      : previewTab === "stok"
        ? barangRows
        : previewTab === "mutasi"
          ? mutasiRows
          : kasbonRows;

  const activeLabel =
    previewTab === "penjualan"
      ? "nota"
      : previewTab === "stok"
        ? "barang"
        : previewTab === "mutasi"
          ? "mutasi"
          : "kasbon";

  const startIndex = (currentPage - 1) * pageSize;
  const pagedTrx = trxRows.slice(startIndex, startIndex + pageSize);
  const pagedBarang = barangRows.slice(startIndex, startIndex + pageSize);
  const pagedMutasi = mutasiRows.slice(startIndex, startIndex + pageSize);
  const pagedKasbon = kasbonRows.slice(startIndex, startIndex + pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {previewTab === "penjualan" && "Rekapitulasi Penjualan"}
          {previewTab === "stok" && "Daftar Harga & Stok Barang"}
          {previewTab === "mutasi" && "Barang Masuk & Keluar"}
          {previewTab === "piutang" && "Piutang & Kasbon Pelanggan"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {previewTab === "penjualan" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Dibayar</th>
                  <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedTrx.map((t) => {
                  const plg = (t.pelanggan as Record<string, unknown>) || {};
                  return (
                    <tr key={String(t.id)} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                        {String(t.no_nota)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(String(t.tanggal)).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {String(plg.nama || "Pelanggan Umum")}
                      </td>
                      <td className="py-3 px-4 font-medium uppercase text-gray-600">
                        {String(t.jenis_pembayaran)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                        Rp {Number(t.total).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        Rp {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-red-600 whitespace-nowrap">
                        Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={String(t.status_bayar)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {previewTab === "stok" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Nama Barang</th>
                  <th className="py-3 px-4">Satuan</th>
                  <th className="py-3 px-4 text-right">Harga Modal</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-right">Stok Terkini</th>
                  <th className="py-3 px-4 text-right">Nilai Jual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedBarang.map((b) => (
                  <tr key={String(b.id)} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-bold text-blue-600">
                      {String(b.kode_barang)}
                    </td>
                    <td className="py-2.5 px-4">{String(b.kategori)}</td>
                    <td className="py-2.5 px-4 font-semibold text-gray-900">
                      {String(b.nama)}
                    </td>
                    <td className="py-2.5 px-4">
                      {String(b.satuan_dasar || b.satuan || "Pcs")}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      Rp{" "}
                      {Number(
                        b.harga_modal || b.harga_beli || 0
                      ).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold whitespace-nowrap">
                      Rp {Number(b.harga || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold">
                      {Number(b.stok)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      Rp{" "}
                      {(
                        Number(b.harga || 0) * Number(b.stok || 0)
                      ).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {previewTab === "mutasi" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Jenis</th>
                  <th className="py-3 px-4">Barang</th>
                  <th className="py-3 px-4 text-right">Stok Sebelum</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4 text-right">Stok Sesudah</th>
                  <th className="py-3 px-4 text-right">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedMutasi.map((m) => {
                  const mut = (m.mutasi as Record<string, unknown>) || {};
                  const brg = (m.barang as Record<string, unknown>) || {};
                  return (
                    <tr key={String(m.id)} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {mut.tanggal
                          ? new Date(String(mut.tanggal)).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <StatusBadge status={String(mut.jenis || "masuk")} />
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">
                        [{String(brg.kode_barang)}] {String(brg.nama)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {Number(m.stok_sebelum)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold">
                        {Number(m.jumlah)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold">
                        {Number(m.stok_sesudah)}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        Rp{" "}
                        {Number(m.total_harga || 0).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {previewTab === "piutang" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-4 text-right">Jumlah Kasbon</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedKasbon.map((k) => {
                  const plg = (k.pelanggan as Record<string, unknown>) || {};
                  const trx = (k.transaksi as Record<string, unknown>) || {};
                  return (
                    <tr key={String(k.id)} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(
                          String(k.tanggal_pengajuan)
                        ).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">
                        {String(plg.nama || "-")}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                        {String(trx.no_nota || "-")}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold whitespace-nowrap">
                        Rp{" "}
                        {Number(k.jumlah_kasbon || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <StatusBadge status={String(k.status)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <TablePagination
          currentPage={currentPage}
          totalItems={activeRows.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel={activeLabel}
        />
      </CardContent>
    </Card>
  );
}
