"use client";

import { useState, useEffect, useMemo } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  SearchField,
  TablePagination,
} from "@/components/ui";
import { Edit3, Trash2 } from "lucide-react";
import type { PelangganRow } from "../layanan-piutang";

interface TabelDataPelangganProps {
  search: string;
  onSearchChange: (val: string) => void;
  pelangganList: PelangganRow[];
  onEditPelanggan: (pelanggan: PelangganRow) => void;
  onDeletePelanggan: (pelanggan: PelangganRow) => void;
}

export function TabelDataPelanggan({
  search,
  onSearchChange,
  pelangganList,
  onEditPelanggan,
  onDeletePelanggan,
}: TabelDataPelangganProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredPelanggan = useMemo(
    () =>
      pelangganList.filter(
        (p) =>
          p.nama.toLowerCase().includes(search.toLowerCase()) ||
          (p.kontak || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.alamat || "").toLowerCase().includes(search.toLowerCase())
      ),
    [pelangganList, search]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filteredPelanggan.length]);

  const pagedPelanggan = filteredPelanggan.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="flex flex-col gap-4 print:hidden">
      <SearchField
        placeholder="Cari nama pelanggan, kontak, atau alamat..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:max-w-md"
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                  <th className="py-3 px-4">Nama Pelanggan</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4">Alamat</th>
                  <th className="py-3 px-4 text-right">Batas Kasbon</th>
                  <th className="py-3 px-4 text-center">Status Kasbon</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {pagedPelanggan.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {p.nama}
                    </td>
                    <td className="py-3 px-4 uppercase text-xs text-gray-600">
                      {p.jenis}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {p.kontak || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">
                      {p.alamat || "-"}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                      Rp {Number(p.batas_kasbon).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={p.status_kasbon} tone="success" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Ubah ${p.nama}`}
                          onClick={() => onEditPelanggan(p)}
                          className="h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-blue-600 rounded cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus ${p.nama}`}
                          onClick={() => onDeletePelanggan(p)}
                          className="h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredPelanggan.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="pelanggan"
          />
        </CardContent>
      </Card>
    </div>
  );
}
