"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  CustomSelect,
  TablePagination,
} from "@/components/ui";
import { Plus } from "lucide-react";
import type {
  BarangRow,
  RestokJoined,
  FormRestokState,
} from "../layanan-barang";

interface PanelRestokBarangProps {
  lowStockItems: BarangRow[];
  restokList: RestokJoined[];
  items: BarangRow[];
  setRestokForm: React.Dispatch<React.SetStateAction<FormRestokState>>;
  setShowRestokModal: (val: boolean) => void;
  handleUbahStatusRestok: (r: RestokJoined, nextStatus: string) => void;
}

export function PanelRestokBarang({
  lowStockItems,
  restokList,
  items,
  setRestokForm,
  setShowRestokModal,
  handleUbahStatusRestok,
}: PanelRestokBarangProps) {
  const [lowPage, setLowPage] = useState(1);
  const [lowPageSize, setLowPageSize] = useState(10);

  const [restokPage, setRestokPage] = useState(1);
  const [restokPageSize, setRestokPageSize] = useState(10);

  useEffect(() => {
    setLowPage(1);
  }, [lowStockItems.length]);

  useEffect(() => {
    setRestokPage(1);
  }, [restokList.length]);

  const pagedLowStock = lowStockItems.slice(
    (lowPage - 1) * lowPageSize,
    lowPage * lowPageSize
  );
  const pagedRestok = restokList.slice(
    (restokPage - 1) * restokPageSize,
    restokPage * restokPageSize
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:hidden">
      <Card>
        <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-2">
          <CardTitle>
            Daftar Barang Stok Menipis ({lowStockItems.length} Barang)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {lowStockItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Seluruh barang berada di atas batas stok minimum.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-2.5 px-4">Kode</th>
                      <th className="py-2.5 px-4">Nama Barang</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">
                        Sisa Stok
                      </th>
                      <th className="py-2.5 px-4 text-right">Min</th>
                      <th className="py-2.5 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {pagedLowStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-bold text-blue-600 whitespace-nowrap">
                          {item.kode_barang}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {item.nama}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-red-600 whitespace-nowrap">
                          {item.stok} {item.satuan}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-500">
                          {item.stok_min}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="whitespace-nowrap"
                            onClick={() => {
                              setRestokForm({
                                barang_id: item.id,
                                restok: String(
                                  Math.max(20, item.stok_min * 3 - item.stok)
                                ),
                                target: `Pengadaan ulang ${item.nama}`,
                              });
                              setShowRestokModal(true);
                            }}
                          >
                            Rencanakan Restok
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={lowPage}
                totalItems={lowStockItems.length}
                pageSize={lowPageSize}
                onPageChange={setLowPage}
                onPageSizeChange={setLowPageSize}
                pageSizeOptions={[5, 10, 25]}
                itemLabel="barang"
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-wrap flex-row items-center justify-between gap-2">
          <CardTitle>
            Daftar Rencana Restok Internal ({restokList.length})
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setRestokForm({
                barang_id: lowStockItems[0]?.id || items[0]?.id || "",
                restok: "25",
                target: "Pengadaan rutin mingguan",
              });
              setShowRestokModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Rencana</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {restokList.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Belum ada catatan rencana restok.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-2.5 px-4">Tanggal</th>
                      <th className="py-2.5 px-4">Barang</th>
                      <th className="py-2.5 px-4 text-right whitespace-nowrap">
                        Rencana Qty
                      </th>
                      <th className="py-2.5 px-4">Status Restok</th>
                      <th className="py-2.5 px-4">Catatan Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-xs">
                    {pagedRestok.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                          {new Date(r.tanggal).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900 min-w-[140px]">
                          <span className="font-bold text-blue-600 mr-1">
                            {r.barang?.kode_barang}
                          </span>
                          {r.barang?.nama}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-emerald-700 whitespace-nowrap">
                          +{r.jumlah_restok ?? r.restok} {r.barang?.satuan}
                        </td>
                        <td className="py-2.5 px-4">
                          <CustomSelect
                            value={r.status || "direncanakan"}
                            onChange={(e) =>
                              handleUbahStatusRestok(r, e.target.value)
                            }
                            aria-label={`Status restok ${r.barang?.nama || ""}`}
                            className="w-36 sm:w-40"
                          >
                            <option value="direncanakan">Direncanakan</option>
                            <option value="dipesan">Dipesan</option>
                            <option value="selesai">Selesai</option>
                            <option value="batal">Batal</option>
                          </CustomSelect>
                        </td>
                        <td className="py-2.5 px-4 text-gray-600 min-w-[140px]">
                          {r.target || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={restokPage}
                totalItems={restokList.length}
                pageSize={restokPageSize}
                onPageChange={setRestokPage}
                onPageSizeChange={setRestokPageSize}
                pageSizeOptions={[5, 10, 25]}
                itemLabel="rencana"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
