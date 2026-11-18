"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  TablePagination,
} from "@/components/ui";
import { Plus } from "lucide-react";
import type {
  BarangRow,
  MutasiJoined,
  FormMutasiState,
} from "../layanan-barang";

interface TabelMutasiBarangProps {
  mutasiList: MutasiJoined[];
  items: BarangRow[];
  setMutasiForm: React.Dispatch<React.SetStateAction<FormMutasiState>>;
  setShowMutasiModal: (val: boolean) => void;
}

export function TabelMutasiBarang({
  mutasiList,
  items,
  setMutasiForm,
  setShowMutasiModal,
}: TabelMutasiBarangProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [mutasiList.length]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedMutasi = mutasiList.slice(startIndex, startIndex + pageSize);

  return (
    <Card className="print:hidden">
      <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-3">
        <CardTitle>Riwayat Barang Masuk & Keluar</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setMutasiForm({
              jenis: "masuk",
              barang_id: items[0]?.id || "",
              jumlah: "10",
              supplier: "",
              no_referensi: `BM-${Date.now().toString().slice(-5)}`,
              tujuan: "Gudang Utama",
              keterangan: "",
            });
            setShowMutasiModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Input Mutasi Baru</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 text-center">Jenis</th>
                <th className="py-3 px-4">No. Referensi</th>
                <th className="py-3 px-4">Kode & Nama Barang</th>
                <th className="py-3 px-4 text-right">Stok Awal</th>
                <th className="py-3 px-4 text-right">Jumlah</th>
                <th className="py-3 px-4 text-right">Stok Akhir</th>
                <th className="py-3 px-4 text-right">Harga Satuan</th>
                <th className="py-3 px-4 text-right">Total Nilai</th>
                <th className="py-3 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {pagedMutasi.map((m) => {
                const isMasuk = m.mutasi?.jenis === "masuk";
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                      {m.mutasi?.tanggal
                        ? new Date(m.mutasi.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <StatusBadge
                        status={isMasuk ? "masuk" : "keluar"}
                        label={m.mutasi?.jenis ? undefined : "Mutasi"}
                      />
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-gray-700 whitespace-nowrap">
                      {m.mutasi?.no_referensi || "-"}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-900">
                      <span className="font-bold text-blue-600 mr-1.5">
                        {m.barang?.kode_barang}
                      </span>
                      {m.barang?.nama}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600">
                      {m.stok_sebelum}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${
                        isMasuk ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {isMasuk ? `+${m.jumlah}` : `-${m.jumlah}`}{" "}
                      {m.barang?.satuan}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-gray-900">
                      {m.stok_sesudah}
                    </td>
                    <td className="py-2.5 px-4 text-right text-gray-600 whitespace-nowrap">
                      Rp {Number(m.harga_satuan || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                      Rp {Number(m.total_harga || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-2.5 px-4 text-gray-500">
                      {m.mutasi?.supplier ||
                        m.mutasi?.tujuan ||
                        m.keterangan ||
                        "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalItems={mutasiList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="mutasi"
        />
      </CardContent>
    </Card>
  );
}
