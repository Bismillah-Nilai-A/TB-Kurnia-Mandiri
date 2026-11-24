import { supabase } from "@/lib/supabase";

export interface TransactionRow {
  no_nota: string;
  pelanggan: string;
  total: number;
  metode: string;
  status: string;
  tanggal: string;
}

export const DEFAULT_RECENT_TRANSACTIONS: TransactionRow[] = [
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
];

export const DEFAULT_DASHBOARD_SUMMARY = {
  totalTransaksi: 12,
  pendapatanHariIni: 24500000,
  stokMenipisCount: 3,
  pelangganCount: 8,
};

export async function muatDataDashboard() {
  let totalTransaksi = DEFAULT_DASHBOARD_SUMMARY.totalTransaksi;
  let pendapatanHariIni = DEFAULT_DASHBOARD_SUMMARY.pendapatanHariIni;
  let stokMenipisCount = DEFAULT_DASHBOARD_SUMMARY.stokMenipisCount;
  let pelangganCount = DEFAULT_DASHBOARD_SUMMARY.pelangganCount;
  let recentTransactions = DEFAULT_RECENT_TRANSACTIONS;

  try {
    const { data: txData } = await supabase
      .from("transaksi")
      .select(
        "no_nota, total, jenis_pembayaran, status_bayar, tanggal, pelanggan:pelanggan_id(nama)"
      )
      .order("tanggal", { ascending: false })
      .limit(5);

    if (txData && txData.length > 0) {
      recentTransactions = txData.map((t: any) => ({
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

      totalTransaksi = txData.length;
      pendapatanHariIni = txData.reduce(
        (acc: number, curr: any) => acc + (Number(curr.total) || 0),
        0
      );
    }

    const { data: lowStock } = await supabase
      .from("barang")
      .select("id_barang, stok, stok_minimum")
      .lt("stok", 20);

    if (lowStock) {
      stokMenipisCount = lowStock.filter(
        (b) => Number(b.stok) <= Number(b.stok_minimum ?? 5)
      ).length;
    }

    const { count: custCount } = await supabase
      .from("pelanggan")
      .select("*", { count: "exact", head: true });

    if (custCount !== null && custCount !== undefined) {
      pelangganCount = custCount;
    }
  } catch {
    // Gunakan data fallback lokal saat offline
  }

  return {
    totalTransaksi,
    pendapatanHariIni,
    stokMenipisCount,
    pelangganCount,
    recentTransactions,
  };
}
