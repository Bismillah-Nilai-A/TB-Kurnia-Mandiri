"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import {
  Card,
  CardContent,
  Button,
  SearchField,
  ResponsiveTabs,
} from "@/components/ui";
import { Printer } from "lucide-react";
import { type TransaksiRow, STATUS_MAP } from "../layanan-transaksi";

interface TabelRiwayatTransaksiProps {
  searchTrx: string;
  setSearchTrx: (val: string) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  filteredTransactions: TransaksiRow[];
  setStrukTrx: (trx: TransaksiRow | null) => void;
}

export function TabelRiwayatTransaksi({
  searchTrx,
  setSearchTrx,
  activeTab,
  setActiveTab,
  filteredTransactions,
  setStrukTrx,
}: TabelRiwayatTransaksiProps) {
  return (
    <div className="flex flex-col gap-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchField
          placeholder="Cari nomor nota (INV-...) atau nama pelanggan..."
          value={searchTrx}
          onChange={(e) => setSearchTrx(e.target.value)}
          className="max-w-md flex-1 min-w-[220px]"
        />
        <ResponsiveTabs
          value={activeTab}
          onChange={(t) => setActiveTab(t)}
          aria-label="Filter status pembayaran nota"
          options={[
            { id: "Semua", label: "Semua" },
            { id: "Lunas", label: "Lunas" },
            { id: "Menunggu", label: "Menunggu" },
            { id: "Sebagian", label: "Sebagian" },
            { id: "Dibatalkan", label: "Dibatalkan" },
          ]}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Dibayar</th>
                  <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4 text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredTransactions.map((t) => {
                  const st =
                    STATUS_MAP[t.status_bayar] || STATUS_MAP.menunggu;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs font-bold text-blue-600">
                        {t.no_nota}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {t.pelanggan?.nama || "Pelanggan Umum"}
                      </td>
                      <td className="py-3 px-4 text-gray-600 uppercase text-xs font-semibold">
                        {t.jenis_pembayaran}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        Rp {Number(t.total).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700 font-medium">
                        Rp {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status_bayar} label={st.label} />
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(t.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setStrukTrx(t)}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
