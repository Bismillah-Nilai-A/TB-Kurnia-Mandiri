import { supabase, logAktivitas } from "@/lib/supabase";
import { mapBarangWithSatuan } from "@/components/barang/layanan-barang";

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
    aktivitas: `Unduh CSV ${filename}`.slice(0, 50),
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
      .select("*, satuan_barang(*)")
      .order("kode_barang", { ascending: true }),
    supabase
      .from("detail_mutasi_barang")
      .select(
        `
        *,
        mutasi:mutasi_barang(jenis, pemasok_id, no_surat_jalan, jenis_bayar, tujuan, alasan, tanggal, pemasok:pemasok_id(nama)),
        barang:barang_id(kode_barang, nama, satuan_dasar)
      `
      )
      .order("id_detail_mutasi", { ascending: false }),
    supabase
      .from("kasbon")
      .select(
        "*, pelanggan:pelanggan_id(nama), transaksi:transaksi_id(no_nota)"
      )
      .order("tanggal_pengajuan", { ascending: false }),
  ]);

  const trxs: Array<Record<string, unknown>> = (
    (trxRes.data || []) as Array<Record<string, unknown>>
  ).map((t) => ({
    ...t,
    id: String(t.id_transaksi || t.id),
  }));
  const rawBrgs = (brgRes.data || []) as Array<Record<string, unknown>>;
  const brgs = rawBrgs.map(
    (b) => mapBarangWithSatuan(b) as unknown as Record<string, unknown>
  );

  const muts: Array<Record<string, unknown>> = (
    (mutRes.data || []) as Array<Record<string, unknown>>
  ).map((m) => {
    const rawMut = (m.mutasi as Record<string, unknown>) || {};
    const rawBrg = (m.barang as Record<string, unknown>) || {};
    const pmk = (rawMut.pemasok as Record<string, unknown>) || null;
    return {
      ...m,
      id: String(m.id_detail_mutasi || m.id),
      harga_satuan: Number(m.harga_beli ?? 0),
      total_harga: Number(m.subtotal ?? 0),
      keterangan: rawMut.alasan ? String(rawMut.alasan) : "",
      mutasi: {
        ...rawMut,
        supplier: pmk?.nama ? String(pmk.nama) : null,
        no_referensi: rawMut.no_surat_jalan
          ? String(rawMut.no_surat_jalan)
          : null,
      },
      barang: {
        ...rawBrg,
        satuan: String(rawBrg.satuan_dasar || "Pcs"),
      },
    };
  });

  const ksbs: Array<Record<string, unknown>> = (
    (ksbRes.data || []) as Array<Record<string, unknown>>
  ).map((k) => ({
    ...k,
    id: String(k.id_kasbon || k.id),
  }));

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
    (s, b) =>
      s +
      Number(b.harga_modal || b.harga_beli || 0) * Number(b.stok || 0),
    0
  );
  const nilaiJual = brgs.reduce(
    (s, b) => s + Number(b.harga || 0) * Number(b.stok || 0),
    0
  );
  const lowCount = brgs.filter(
    (b) => Number(b.stok) <= Number(b.stok_minimum ?? b.stok_min ?? 5)
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
