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
import { Banknote, CheckCircle2, XCircle } from "lucide-react";
import type { PiutangTransaksi, KasbonJoined } from "../layanan-piutang";

interface TabelTagihanPiutangProps {
  activeTab: "tagihan" | "persetujuan";
  loading: boolean;
  submitting: boolean;
  tagihanList: PiutangTransaksi[];
  kasbonList: KasbonJoined[];
  onOpenBayarModal: (tagihan: PiutangTransaksi) => void;
  onSetujuiKasbon: (kasbon: KasbonJoined) => void;
  onOpenTolakModal: (kasbon: KasbonJoined) => void;
}

export function TabelTagihanPiutang({
  activeTab,
  loading,
  submitting,
  tagihanList,
  kasbonList,
  onOpenBayarModal,
  onSetujuiKasbon,
  onOpenTolakModal,
}: TabelTagihanPiutangProps) {
  const [tagihanPage, setTagihanPage] = useState(1);
  const [tagihanPageSize, setTagihanPageSize] = useState(10);

  const [kasbonPage, setKasbonPage] = useState(1);
  const [kasbonPageSize, setKasbonPageSize] = useState(10);

  useEffect(() => {
    setTagihanPage(1);
  }, [tagihanList.length]);

  useEffect(() => {
    setKasbonPage(1);
  }, [kasbonList.length]);

  const pagedTagihan = tagihanList.slice(
    (tagihanPage - 1) * tagihanPageSize,
    tagihanPage * tagihanPageSize
  );
  const pagedKasbon = kasbonList.slice(
    (kasbonPage - 1) * kasbonPageSize,
    kasbonPage * kasbonPageSize
  );

  if (activeTab === "tagihan") {
    return (
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Tagihan Belum Lunas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Memuat daftar tagihan piutang...
            </div>
          ) : tagihanList.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Tidak ada nota piutang yang belum lunas saat ini.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                      <th className="py-3 px-4">No. Nota</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4 text-right">Total Nota</th>
                      <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                      <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {pagedTagihan.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs font-bold text-blue-600 whitespace-nowrap">
                          {t.no_nota}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {t.pelanggan?.nama || "Pelanggan"}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 whitespace-nowrap">
                          Rp {Number(t.total).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-700 font-medium whitespace-nowrap">
                          Rp {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-red-600 whitespace-nowrap">
                          Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={t.status_bayar} tone="warning" />
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(t.tanggal).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            onClick={() => onOpenBayarModal(t)}
                          >
                            <Banknote className="w-3.5 h-3.5" />
                            <span>Bayar</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={tagihanPage}
                totalItems={tagihanList.length}
                pageSize={tagihanPageSize}
                onPageChange={setTagihanPage}
                onPageSizeChange={setTagihanPageSize}
                itemLabel="tagihan"
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle>Persetujuan Kasbon</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">No. Nota</th>
                <th className="py-3 px-4 text-right">Nominal Kasbon</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {pagedKasbon.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(k.tanggal_pengajuan).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {k.pelanggan?.nama || "-"}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-blue-600 whitespace-nowrap">
                    {k.transaksi?.no_nota || "-"}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                    Rp {Number(k.jumlah_kasbon).toLocaleString("id-ID")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge
                      status={k.status}
                      tone={
                        k.status === "disetujui" || k.status === "lunas"
                          ? "success"
                          : k.status === "ditolak"
                            ? "danger"
                            : "warning"
                      }
                    />
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {k.alasan_penolakan ||
                      (k.tanggal_keputusan
                        ? `Diputuskan ${new Date(k.tanggal_keputusan).toLocaleDateString("id-ID")}`
                        : "Menunggu verifikasi")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {k.status === "menunggu" ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => onSetujuiKasbon(k)}
                          disabled={submitting}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onOpenTolakModal(k)}
                          disabled={submitting}
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Tolak</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={kasbonPage}
          totalItems={kasbonList.length}
          pageSize={kasbonPageSize}
          onPageChange={setKasbonPage}
          onPageSizeChange={setKasbonPageSize}
          itemLabel="pengajuan"
        />
      </CardContent>
    </Card>
  );
}
