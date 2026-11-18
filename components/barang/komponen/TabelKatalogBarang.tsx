"use client";

import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  SearchField,
  CustomSelect,
  TablePagination,
} from "@/components/ui";
import { Barcode, Edit3, Trash2 } from "lucide-react";
import type { BarangRow } from "../layanan-barang";

interface TabelKatalogBarangProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: string[];
  filterStok: "semua" | "menipis";
  setFilterStok: (val: "semua" | "menipis") => void;
  lowStockCount: number;
  loading: boolean;
  filtered: BarangRow[];
  setBarcodeItem: (item: BarangRow | null) => void;
  openEditModal: (item: BarangRow) => void;
  handleDeleteBarang: (item: BarangRow) => void;
}

export function TabelKatalogBarang({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  filterStok,
  setFilterStok,
  lowStockCount,
  loading,
  filtered,
  setBarcodeItem,
  openEditModal,
  handleDeleteBarang,
}: TabelKatalogBarangProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, filterStok, filtered.length]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedItems = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto] items-center gap-3 print:hidden">
        <SearchField
          placeholder="Cari kode, nama barang, merk, atau barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:col-span-2 lg:col-span-1"
        />
        <CustomSelect
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter kategori barang"
          className="w-full"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "Semua" ? "Semua Kategori" : cat}
            </option>
          ))}
        </CustomSelect>
        <div className="grid grid-cols-2 sm:inline-flex items-center bg-white p-1 rounded-xl border border-[#CBD5E1] w-full sm:w-auto">
          <button
            onClick={() => setFilterStok("semua")}
            className={`min-h-9 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
              filterStok === "semua"
                ? "bg-[#2563EB] text-white"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Semua Stok
          </button>
          <button
            onClick={() => setFilterStok("menipis")}
            className={`min-h-9 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
              filterStok === "menipis"
                ? "bg-[#DC2626] text-white"
                : "text-[#64748B] hover:text-[#1E293B]"
            }`}
          >
            Stok Menipis ({lowStockCount})
          </button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Memuat data barang...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-3 px-3">Kode</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Merk</th>
                      <th className="py-3 px-3">Nama Barang</th>
                      <th className="py-3 px-3">Satuan</th>
                      <th className="py-3 px-3 text-right">Harga Modal</th>
                      <th className="py-3 px-3 text-right">Harga Jual</th>
                      <th className="py-3 px-3 text-right">Stok</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {pagedItems.map((item) => {
                      const hargaModal =
                        Number(item.harga_beli) ||
                        Math.round(Number(item.harga) / 1.3);
                      const hargaJual = Number(item.harga);
                      const isLow = item.stok <= item.stok_min;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 text-xs font-bold text-blue-600 whitespace-nowrap">
                            {item.kode_barang}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-gray-600 whitespace-nowrap">
                            {item.kategori}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-gray-700">
                            {item.merk || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-900">
                            {item.nama}
                          </td>
                          <td className="py-2.5 px-3 text-xs text-gray-600">
                            {item.satuan}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-600 text-xs whitespace-nowrap">
                            Rp {hargaModal.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-gray-900 text-xs whitespace-nowrap">
                            Rp {hargaJual.toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                            {item.stok}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge status={isLow ? "menipis" : "aman"} />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                title="Cetak Label Barcode"
                                aria-label={`Cetak barcode ${item.nama}`}
                                onClick={() => setBarcodeItem(item)}
                                className="h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                              >
                                <Barcode className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Ubah Barang"
                                aria-label={`Ubah ${item.nama}`}
                                onClick={() => openEditModal(item)}
                                className="h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Hapus Barang"
                                aria-label={`Hapus ${item.nama}`}
                                onClick={() => handleDeleteBarang(item)}
                                className="h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={currentPage}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="barang"
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
