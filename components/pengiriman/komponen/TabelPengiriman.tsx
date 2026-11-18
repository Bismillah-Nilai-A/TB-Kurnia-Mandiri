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
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Camera,
  MapPin,
  Eye,
} from "lucide-react";
import type {
  PengirimanRow,
  LaporanKendalaRow,
  TransaksiLookup,
  PengirimLookup,
  UpdatePengirimanMode,
} from "../layanan-pengiriman";

interface TabelPengirimanProps {
  loading: boolean;
  list: PengirimanRow[];
  filtered: PengirimanRow[];
  kendalaList: LaporanKendalaRow[];
  transaksiList: TransaksiLookup[];
  pengirimList: PengirimLookup[];
  onMulaiKirim: (item: PengirimanRow) => void;
  onOpenActionModal: (
    item: PengirimanRow,
    mode: UpdatePengirimanMode
  ) => void;
  onPreviewFoto: (item: PengirimanRow) => void;
}

export function TabelPengiriman({
  loading,
  list,
  filtered,
  kendalaList,
  transaksiList,
  pengirimList,
  onMulaiKirim,
  onOpenActionModal,
  onPreviewFoto,
}: TabelPengirimanProps) {
  const [kirimPage, setKirimPage] = useState(1);
  const [kirimPageSize, setKirimPageSize] = useState(10);

  const [kendalaPage, setKendalaPage] = useState(1);
  const [kendalaPageSize, setKendalaPageSize] = useState(10);

  useEffect(() => {
    setKirimPage(1);
  }, [filtered.length]);

  useEffect(() => {
    setKendalaPage(1);
  }, [kendalaList.length]);

  const pagedKirim = filtered.slice(
    (kirimPage - 1) * kirimPageSize,
    kirimPage * kirimPageSize
  );
  const pagedKendala = kendalaList.slice(
    (kendalaPage - 1) * kendalaPageSize,
    kendalaPage * kendalaPageSize
  );

  return (
    <>
      {/* Tabel Pengiriman */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Memuat daftar pengiriman...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Penerima & Nota</th>
                      <th className="py-3 px-4">Alamat Tujuan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Bukti / Catatan</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {pagedKirim.map((item) => {
                      const isImageData =
                        item.foto_bukti_url?.startsWith("data:image") ||
                        item.foto_bukti_url?.startsWith("http");

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(item.tanggal_penugasan).toLocaleString(
                              "id-ID",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">
                              {item.detail_penerima || "Pelanggan"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.transaksi_id && (
                                <span className="text-blue-600 font-bold mr-2">
                                  {transaksiList.find(
                                    (t) => t.id === item.transaksi_id
                                  )?.no_nota || item.transaksi_id.slice(0, 8)}
                                </span>
                              )}
                              {item.pengirim_id && (
                                <span>
                                  Kurir:{" "}
                                  {pengirimList.find(
                                    (d) => d.id === item.pengirim_id
                                  )?.nama || "Petugas"}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span>{item.alamat_tujuan}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              {item.foto_bukti_url && (
                                <div className="flex items-center gap-2">
                                  {isImageData ? (
                                    <button
                                      type="button"
                                      onClick={() => onPreviewFoto(item)}
                                      className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition cursor-pointer"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={item.foto_bukti_url}
                                        alt="Bukti pengiriman"
                                        width={28}
                                        height={28}
                                        className="w-7 h-7 rounded object-cover border border-emerald-300"
                                      />
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Lihat Bukti</span>
                                    </button>
                                  ) : (
                                    <span className="text-emerald-700 font-medium">
                                      File:{" "}
                                      {item.foto_bukti_nama ||
                                        item.foto_bukti_url}
                                    </span>
                                  )}
                                </div>
                              )}
                              {item.alasan_retur && (
                                <div className="text-red-600 font-medium">
                                  {item.alasan_retur}
                                </div>
                              )}
                              {!item.foto_bukti_url && !item.alasan_retur && (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {item.status === "belum_dikirim" && (
                                <Button
                                  size="sm"
                                  onClick={() => onMulaiKirim(item)}
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Berangkat</span>
                                </Button>
                              )}
                              {item.status !== "diterima" ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      onOpenActionModal(item, "diterima")
                                    }
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Terima</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      onOpenActionModal(item, "kendala")
                                    }
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Kendala</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() =>
                                      onOpenActionModal(item, "retur")
                                    }
                                  >
                                    <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                                    <span>Retur</span>
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() =>
                                    onOpenActionModal(item, "diterima")
                                  }
                                >
                                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Ubah Bukti</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={kirimPage}
                totalItems={filtered.length}
                pageSize={kirimPageSize}
                onPageChange={setKirimPage}
                onPageSizeChange={setKirimPageSize}
                itemLabel="pengiriman"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabel Laporan Kendala Pengiriman */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Kendala ({kendalaList.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {kendalaList.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              Belum ada laporan kendala pengiriman tercatat.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500">
                      <th className="py-2.5 px-4">Waktu Lapor</th>
                      <th className="py-2.5 px-4">Penugasan</th>
                      <th className="py-2.5 px-4">Jenis Kendala</th>
                      <th className="py-2.5 px-4">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagedKendala.map((k) => {
                      const krm = list.find((l) => l.id === k.pengiriman_id);
                      return (
                        <tr key={k.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">
                            {new Date(k.created_at).toLocaleString("id-ID")}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-gray-900">
                            {krm?.detail_penerima ||
                              k.pengiriman_id.slice(0, 8)}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                              {k.jenis_kendala}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-gray-700">
                            {k.deskripsi}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={kendalaPage}
                totalItems={kendalaList.length}
                pageSize={kendalaPageSize}
                onPageChange={setKendalaPage}
                onPageSizeChange={setKendalaPageSize}
                pageSizeOptions={[5, 10, 25]}
                itemLabel="kendala"
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
