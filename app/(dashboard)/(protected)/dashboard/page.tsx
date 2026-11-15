"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ReceiptText,
  UserCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface TransactionRow {
  no_nota: string;
  pelanggan: string;
  total: number;
  metode: string;
  status: string;
  tanggal: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [totalTransaksi, setTotalTransaksi] = useState(12);
  const [pendapatanHariIni, setPendapatanHariIni] = useState(24500000);
  const [stokMenipisCount, setStokMenipisCount] = useState(3);
  const [pelangganCount, setPelangganCount] = useState(8);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRow[]>([
    {
      no_nota: "INV-202610-0001",
      pelanggan: "PT Bumi Karya Sejahtera",
      total: 12500000,
      metode: "QRIS",
      status: "lunas",
      tanggal: "Hari ini, 10:15",
    },
    {
      no_nota: "INV-202610-0002",
      pelanggan: "Pak Slamet Riyadi",
      total: 3500000,
      metode: "Tunai",
      status: "lunas",
      tanggal: "Hari ini, 09:30",
    },
    {
      no_nota: "INV-202610-0003",
      pelanggan: "CV Citra Indah Sentosa",
      total: 8500000,
      metode: "Kasbon",
      status: "sebagian",
      tanggal: "Kemarin, 16:45",
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Coba fetch dari Supabase jika tabel sudah dibuat
      const { data: txData } = await supabase
        .from("transaksi")
        .select("no_nota, total, jenis_pembayaran, status_bayar, tanggal, pelanggan:pelanggan_id(nama)")
        .order("tanggal", { ascending: false })
        .limit(5);

      if (txData && txData.length > 0) {
        const formatted: TransactionRow[] = txData.map((t: any) => ({
          no_nota: t.no_nota,
          pelanggan: t.pelanggan?.nama || "Pelanggan Umum",
          total: Number(t.total) || 0,
          metode: (t.jenis_pembayaran || "tunai").toUpperCase(),
          status: t.status_bayar || "lunas",
          tanggal: new Date(t.tanggal).toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
          }),
        }));
        setRecentTransactions(formatted);

        const totalRevenue = txData.reduce(
          (acc: number, curr: any) => acc + (Number(curr.total) || 0),
          0
        );
        setTotalTransaksi(txData.length);
        setPendapatanHariIni(totalRevenue);
      }

      // Check stock menipis
      const { data: lowStock } = await supabase
        .from("barang")
        .select("id, stok, stok_min")
        .lt("stok", 20);

      if (lowStock) {
        setStokMenipisCount(lowStock.length);
      }

      // Check pelanggan
      const { count: custCount } = await supabase
        .from("pelanggan")
        .select("*", { count: "exact", head: true });

      if (custCount !== null && custCount !== undefined) {
        setPelangganCount(custCount);
      }
    } catch {
      // Fallback ke data lokal
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ringkasan Operasional
          </h1>
          <p className="text-sm text-muted-foreground">
            Aktivitas penjualan dan status stok toko material hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Segarkan
          </Button>
          <Button asChild size="sm">
            <Link href="/transaksi">
              <ReceiptText className="h-4 w-4 mr-2" />
              Buat Transaksi Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaksi Penjualan
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ReceiptText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalTransaksi} Nota
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" /> Transaksi aktif tercatat
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Penjualan
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              Rp {pendapatanHariIni.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tunai, QRIS &amp; Virtual Account
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Perlu Restok
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stokMenipisCount} Material
            </div>
            <Link
              href="/barang"
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center font-medium"
            >
              Lihat stok menipis <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pelanggan
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <UserCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {pelangganCount} Mitra
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Proyek &amp; Perorangan
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Riwayat Transaksi Terkini
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              5 transaksi penjualan nota terakhir di toko.
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transaksi">Lihat Semua</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((row) => (
              <div
                key={row.no_nota}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {row.no_nota}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        row.status === "lunas"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {row.pelanggan} &bull; {row.tanggal}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">
                    Rp {row.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {row.metode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

