import { supabase, logAktivitas } from "@/lib/supabase";

export type PreviewTabLaporan = "penjualan" | "stok" | "mutasi" | "piutang";

export interface ReportSummary {
  totalPenjualan: number;
  jumlahTransaksi: number;
  totalPiutang: number;
  totalBarang: number;
  nilaiStokModal: number;
  nilaiStokJual: number;
  stokMenipisCount: number;
}

export const DEFAULT_REPORT_SUMMARY: ReportSummary = {
  totalPenjualan: 0,
  jumlahTransaksi: 0,
  totalPiutang: 0,
  totalBarang: 0,
  nilaiStokModal: 0,
  nilaiStokJual: 0,
  stokMenipisCount: 0,
};

export async function downloadExcelCSV(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
) {
  const escapeCell = (v: string | number) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };
  const csvContent =
    "\uFEFF" +
    [headers.map(escapeCell).join(";")]
      .concat(rows.map((r) => r.map(escapeCell).join(";")))
      .join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  await logAktivitas({
    modul: "Laporan",
    aktivitas: `Mengunduh laporan Excel/CSV: ${filename}`,
  });
}

export async function muatDataLaporanSupabase() {
  const [trxRes, brgRes, mutRes, ksbRes] = await Promise.all([
    supabase
      .from("transaksi")
      .select("*, pelanggan:pelanggan_id(nama)")
      .order("tanggal", { ascending: false }),
    supabase
      .from("barang")
      .select("*")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("detail_mutasi_barang")
      .select(
        `
        *,
        mutasi:mutasi_barang(jenis, supplier, no_referensi, tujuan, tanggal),
        barang:barang(kode_barang, nama, satuan)
      `
      )
      .order("id", { ascending: false }),
    supabase
      .from("kasbon")
      .select(
        "*, pelanggan:pelanggan_id(nama), transaksi:transaksi_id(no_nota)"
      )
      .order("tanggal_pengajuan", { ascending: false }),
  ]);

  const trxs = (trxRes.data || []) as Array<Record<string, unknown>>;
  const brgs = (brgRes.data || []) as Array<Record<string, unknown>>;
  const muts = (mutRes.data || []) as Array<Record<string, unknown>>;
  const ksbs = (ksbRes.data || []) as Array<Record<string, unknown>>;

  const lunasTrx = trxs.filter((t) => t.status_bayar !== "dibatalkan");
  const totalPenjualan = lunasTrx.reduce(
    (s, t) => s + Number(t.jumlah_dibayar || 0),
    0
  );
  const totalPiutang = trxs.reduce(
    (s, t) => s + Number(t.sisa_tagihan || 0),
    0
  );
  const nilaiModal = brgs.reduce(
    (s, b) => s + Number(b.harga_beli || 0) * Number(b.stok || 0),
    0
  );
  const nilaiJual = brgs.reduce(
    (s, b) => s + Number(b.harga || 0) * Number(b.stok || 0),
    0
  );
  const lowCount = brgs.filter(
    (b) => Number(b.stok) <= Number(b.stok_min)
  ).length;

  const summary: ReportSummary = {
    totalPenjualan,
    jumlahTransaksi: trxs.length,
    totalPiutang,
    totalBarang: brgs.length,
    nilaiStokModal: nilaiModal,
    nilaiStokJual: nilaiJual,
    stokMenipisCount: lowCount,
  };

  return { trxs, brgs, muts, ksbs, summary };
}
