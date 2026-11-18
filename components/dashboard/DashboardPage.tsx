"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import {
  ReceiptText,
  Users,
  TriangleAlert,
  Banknote,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  DEFAULT_DASHBOARD_SUMMARY,
  DEFAULT_RECENT_TRANSACTIONS,
  muatDataDashboard,
  type TransactionRow,
} from "./layanan-dashboard";

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalTransaksi, setTotalTransaksi] = useState(
    DEFAULT_DASHBOARD_SUMMARY.totalTransaksi
  );
  const [pendapatanHariIni, setPendapatanHariIni] = useState(
    DEFAULT_DASHBOARD_SUMMARY.pendapatanHariIni
  );
  const [stokMenipisCount, setStokMenipisCount] = useState(
    DEFAULT_DASHBOARD_SUMMARY.stokMenipisCount
  );
  const [pelangganCount, setPelangganCount] = useState(
    DEFAULT_DASHBOARD_SUMMARY.pelangganCount
  );
  const [recentTransactions, setRecentTransactions] = useState<TransactionRow[]>(
    DEFAULT_RECENT_TRANSACTIONS
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await muatDataDashboard();
      setTotalTransaksi(data.totalTransaksi);
      setPendapatanHariIni(data.pendapatanHariIni);
      setStokMenipisCount(data.stokMenipisCount);
      setPelangganCount(data.pelangganCount);
      setRecentTransactions(data.recentTransactions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Utama" }, { label: "Dashboard" }]}
        title="Ringkasan Hari Ini"
        actions={
          <>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
              Muat Ulang
            </Button>
            <Button asChild>
              <Link href="/transaksi">
                <ReceiptText className="h-5 w-5" />
                Mulai Transaksi Baru
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5 md:col-span-2" data-total-transaksi={totalTransaksi}>
          <span className="text-base font-semibold text-[#64748B]">
            Total Penjualan
          </span>
          <div className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#1E293B]">
            <Banknote className="h-7 w-7 text-[#2563EB]" aria-hidden="true" />
            Rp {pendapatanHariIni.toLocaleString("id-ID")}
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-base font-semibold text-[#64748B]">
            Stok Perlu Diisi
          </span>
          <div className="mt-1 flex items-center gap-2 text-xl font-bold text-[#92400E]">
            <TriangleAlert
              className="h-6 w-6 text-[#F59E0B]"
              aria-hidden="true"
            />
            {stokMenipisCount} barang
          </div>
          <Link
            href="/barang"
            className="mt-1 inline-flex items-center gap-0.5 text-base font-semibold text-[#1D4ED8] hover:underline"
          >
            Lihat Stok Menipis
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>

        <Card className="p-5">
          <span className="text-base font-semibold text-[#64748B]">
            Jumlah Pelanggan
          </span>
          <div className="mt-1 flex items-center gap-2 text-xl font-bold text-[#1E293B]">
            <Users className="h-6 w-6 text-[#2563EB]" aria-hidden="true" />
            {pelangganCount} pelanggan
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Transaksi Terakhir</CardTitle>
          <Link
            href="/transaksi"
            className="inline-flex items-center gap-0.5 text-base font-semibold text-[#1D4ED8] hover:underline"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </CardHeader>

        {recentTransactions.length === 0 ? (
          <p className="px-5 py-10 text-center text-base text-[#64748B]">
            Belum ada transaksi. Tekan Mulai Transaksi Baru untuk mencatat
            penjualan pertama.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-[#F8FAFC] text-left text-[#64748B]">
                <tr>
                  <th className="px-5 py-3 font-semibold">No. Nota</th>
                  <th className="px-5 py-3 font-semibold">Pelanggan</th>
                  <th className="px-5 py-3 font-semibold">Waktu</th>
                  <th className="px-5 py-3 font-semibold">Bayar</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentTransactions.map((row) => (
                  <tr key={row.no_nota} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-semibold text-[#1D4ED8] whitespace-nowrap">
                      {row.no_nota}
                    </td>
                    <td className="px-5 py-3 text-[#1E293B]">
                      {row.pelanggan}
                    </td>
                    <td className="px-5 py-3 text-[#64748B] whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{row.metode}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#1E293B] whitespace-nowrap">
                      Rp {row.total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
