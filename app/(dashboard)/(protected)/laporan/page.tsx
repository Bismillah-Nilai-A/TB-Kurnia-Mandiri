"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
} from "@/components/ui";
import { supabase, logAktivitas } from "@/lib/supabase";
import {
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Package,
  CreditCard,
  ArrowUpDown,
} from "lucide-react";

export default function LaporanPage() {
  const [dariTanggal, setDariTanggal] = useState("2026-01-01");
  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalPenjualan: 0,
    jumlahTransaksi: 0,
    totalPiutang: 0,
    totalBarang: 0,
    nilaiStokModal: 0,
    nilaiStokJual: 0,
    stokMenipisCount: 0,
  });

  const [previewTab, setPreviewTab] = useState<
    "penjualan" | "stok" | "mutasi" | "piutang"
  >("penjualan");
  const [trxRows, setTrxRows] = useState<Array<Record<string, unknown>>>([]);
  const [barangRows, setBarangRows] = useState<Array<Record<string, unknown>>>(
    []
  );
  const [mutasiRows, setMutasiRows] = useState<Array<Record<string, unknown>>>(
    []
  );
  const [kasbonRows, setKasbonRows] = useState<Array<Record<string, unknown>>>(
    []
  );

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
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

      const trxs = trxRes.data || [];
      const brgs = brgRes.data || [];
      const muts = mutRes.data || [];
      const ksbs = ksbRes.data || [];

      setTrxRows(trxs as Array<Record<string, unknown>>);
      setBarangRows(brgs as Array<Record<string, unknown>>);
      setMutasiRows(muts as Array<Record<string, unknown>>);
      setKasbonRows(ksbs as Array<Record<string, unknown>>);

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

      setSummary({
        totalPenjualan,
        jumlahTransaksi: trxs.length,
        totalPiutang,
        totalBarang: brgs.length,
        nilaiStokModal: nilaiModal,
        nilaiStokJual: nilaiJual,
        stokMenipisCount: lowCount,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Helper unduh CSV kompatibel Microsoft Excel (UTF-8 BOM + titik koma)
  const downloadExcelCSV = async (
    filename: string,
    headers: string[],
    rows: Array<Array<string | number>>
  ) => {
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
  };

  const handleExportStokExcel = () => {
    const headers = [
      "Kode Barang",
      "Kategori",
      "Merk",
      "Nama Barang",
      "Satuan",
      "Harga Modal (Rp)",
      "Harga Jual (Rp)",
      "Stok Awal",
      "Stok Akhir",
      "Stok Min",
      "Nilai Modal (Rp)",
      "Nilai Jual (Rp)",
      "Keterangan",
    ];
    const rows = barangRows.map((b) => [
      String(b.kode_barang || ""),
      String(b.kategori || ""),
      String(b.merk || "-"),
      String(b.nama || ""),
      String(b.satuan || "pcs"),
      Number(b.harga_beli || 0),
      Number(b.harga || 0),
      Number(b.stok_awal || 0),
      Number(b.stok || 0),
      Number(b.stok_min || 5),
      Number(b.harga_beli || 0) * Number(b.stok || 0),
      Number(b.harga || 0) * Number(b.stok || 0),
      String(b.keterangan || ""),
    ]);
    downloadExcelCSV("Laporan_Stok_dan_Daftar_Harga_CV_Kurnia_Mandiri", headers, rows);
  };

  const handleExportMutasiExcel = () => {
    const headers = [
      "Tanggal",
      "Jenis Mutasi",
      "No Referensi",
      "Kode Barang",
      "Nama Barang",
      "Stok Sebelum",
      "Jumlah",
      "Stok Sesudah",
      "Harga Satuan (Rp)",
      "Total Harga (Rp)",
      "Supplier / Tujuan",
      "Keterangan",
    ];
    const rows = mutasiRows.map((m) => {
      const mut = (m.mutasi as Record<string, unknown>) || {};
      const brg = (m.barang as Record<string, unknown>) || {};
      return [
        mut.tanggal
          ? new Date(String(mut.tanggal)).toLocaleDateString("id-ID")
          : "-",
        String(mut.jenis || ""),
        String(mut.no_referensi || "-"),
        String(brg.kode_barang || ""),
        String(brg.nama || ""),
        Number(m.stok_sebelum || 0),
        Number(m.jumlah || 0),
        Number(m.stok_sesudah || 0),
        Number(m.harga_satuan || 0),
        Number(m.total_harga || 0),
        String(mut.supplier || mut.tujuan || "-"),
        String(m.keterangan || ""),
      ];
    });
    downloadExcelCSV("Laporan_Keluar_Masuk_Barang_Otomatis", headers, rows);
  };

  const handleExportPenjualanExcel = () => {
    const headers = [
      "No Nota",
      "Tanggal",
      "Pelanggan",
      "Metode Pembayaran",
      "Total Belanja (Rp)",
      "Jumlah Dibayar (Rp)",
      "Sisa Tagihan (Rp)",
      "Status Pembayaran",
    ];
    const rows = trxRows.map((t) => {
      const plg = (t.pelanggan as Record<string, unknown>) || {};
      return [
        String(t.no_nota || ""),
        t.tanggal
          ? new Date(String(t.tanggal)).toLocaleDateString("id-ID")
          : "-",
        String(plg.nama || "Pelanggan Umum"),
        String(t.jenis_pembayaran || "").toUpperCase(),
        Number(t.total || 0),
        Number(t.jumlah_dibayar || 0),
        Number(t.sisa_tagihan || 0),
        String(t.status_bayar || "").toUpperCase(),
      ];
    });
    downloadExcelCSV("Laporan_Rekap_Penjualan_POS", headers, rows);
  };

  const handleExportPiutangExcel = () => {
    const headers = [
      "Tanggal Pengajuan",
      "Pelanggan",
      "No Nota",
      "Jumlah Kasbon (Rp)",
      "Status Kasbon",
      "Alasan Penolakan",
    ];
    const rows = kasbonRows.map((k) => {
      const plg = (k.pelanggan as Record<string, unknown>) || {};
      const trx = (k.transaksi as Record<string, unknown>) || {};
      return [
        k.tanggal_pengajuan
          ? new Date(String(k.tanggal_pengajuan)).toLocaleDateString("id-ID")
          : "-",
        String(plg.nama || "-"),
        String(trx.no_nota || "-"),
        Number(k.jumlah_kasbon || 0),
        String(k.status || "").toUpperCase(),
        String(k.alasan_penolakan || "-"),
      ];
    });
    downloadExcelCSV("Laporan_Piutang_dan_Kasbon_Pelanggan", headers, rows);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Pusat Laporan Penjualan, Persediaan & Piutang
          </h1>
          <p className="text-sm text-gray-500">
            Unduh laporan format Excel (.csv) atau cetak laporan resmi CV Kurnia
            Mandiri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>Cetak Halaman Laporan (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Filter Periode */}
      <Card className="print:hidden">
        <CardContent className="p-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
              />
            </div>
            <div>
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
              />
            </div>
            <Button onClick={fetchReportData} disabled={loading}>
              Terapkan Periode
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportStokExcel}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Excel Stok & Harga</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportMutasiExcel}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Unduh Excel Keluar/Masuk</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportPenjualanExcel}
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Unduh Excel Penjualan</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportPiutangExcel}
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Unduh Excel Piutang</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan Eksekutif */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Penerimaan Penjualan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-600 mt-1">
            Rp {summary.totalPenjualan.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-gray-400">
            Dari {summary.jumlahTransaksi} transaksi tercatat
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total Piutang Belum Tertagih</span>
            <CreditCard className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-lg font-bold text-red-600 mt-1">
            Rp {summary.totalPiutang.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-gray-400">Kasbon aktif pelanggan</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Nilai Persediaan (Modal)</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            Rp {summary.nilaiStokModal.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-gray-400">
            {summary.totalBarang} SKU barang ({summary.stokMenipisCount} stok
            menipis)
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Estimasi Nilai Jual Gudang</span>
            <ArrowUpDown className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg font-bold text-blue-600 mt-1">
            Rp {summary.nilaiStokJual.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-gray-400">
            Potensi margin Rp{" "}
            {(summary.nilaiStokJual - summary.nilaiStokModal).toLocaleString(
              "id-ID"
            )}
          </p>
        </div>
      </div>

      {/* Tab Pratinjau Tabel Laporan */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 print:hidden">
        {[
          { id: "penjualan", label: `Rekap Penjualan (${trxRows.length})` },
          {
            id: "stok",
            label: `Daftar Harga & Stok Barang (${barangRows.length})`,
          },
          {
            id: "mutasi",
            label: `Keluar Masuk Barang (${mutasiRows.length})`,
          },
          { id: "piutang", label: `Daftar Kasbon (${kasbonRows.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() =>
              setPreviewTab(
                t.id as "penjualan" | "stok" | "mutasi" | "piutang"
              )
            }
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
              previewTab === t.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabel Pratinjau */}
      <Card>
        <CardHeader>
          <CardTitle>
            {previewTab === "penjualan" &&
              "Laporan Rekapitulasi Transaksi Penjualan"}
            {previewTab === "stok" &&
              "Laporan Daftar Harga & Posisi Stok Barang CV Kurnia Mandiri"}
            {previewTab === "mutasi" &&
              "Laporan Stok Barang Keluar Masuk Otomatis"}
            {previewTab === "piutang" &&
              "Laporan Piutang & Pengajuan Kasbon Pelanggan"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {previewTab === "penjualan" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">No. Nota</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Metode</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Dibayar</th>
                    <th className="py-3 px-4 text-right">Sisa Tagihan</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {trxRows.map((t) => {
                    const plg = (t.pelanggan as Record<string, unknown>) || {};
                    return (
                      <tr key={String(t.id)} className="hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                          {String(t.no_nota)}
                        </td>
                        <td className="py-2.5 px-4 text-gray-500">
                          {new Date(String(t.tanggal)).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {String(plg.nama || "Pelanggan Umum")}
                        </td>
                        <td className="py-2.5 px-4 uppercase">
                          {String(t.jenis_pembayaran)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold">
                          Rp {Number(t.total).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-right text-emerald-700">
                          Rp {Number(t.jumlah_dibayar).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 text-right text-red-600">
                          Rp {Number(t.sisa_tagihan).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2.5 px-4 uppercase font-semibold">
                          {String(t.status_bayar)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {previewTab === "stok" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Kode</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Merk</th>
                    <th className="py-3 px-4">Nama Barang</th>
                    <th className="py-3 px-4">Satuan</th>
                    <th className="py-3 px-4 text-right">Harga Modal</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-right">Stok Akhir</th>
                    <th className="py-3 px-4 text-right">Nilai Jual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {barangRows.map((b) => (
                    <tr key={String(b.id)} className="hover:bg-gray-50">
                      <td className="py-2 px-4 font-mono font-bold text-blue-600">
                        {String(b.kode_barang)}
                      </td>
                      <td className="py-2 px-4">{String(b.kategori)}</td>
                      <td className="py-2 px-4">{String(b.merk || "—")}</td>
                      <td className="py-2 px-4 font-medium text-gray-900">
                        {String(b.nama)}
                      </td>
                      <td className="py-2 px-4">{String(b.satuan)}</td>
                      <td className="py-2 px-4 text-right">
                        Rp {Number(b.harga_beli || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold">
                        Rp {Number(b.harga || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-4 text-right font-bold">
                        {Number(b.stok)}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-emerald-700">
                        Rp{" "}
                        {(
                          Number(b.harga || 0) * Number(b.stok || 0)
                        ).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {previewTab === "mutasi" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Barang</th>
                    <th className="py-3 px-4 text-right">Stok Sebelum</th>
                    <th className="py-3 px-4 text-right">Jumlah</th>
                    <th className="py-3 px-4 text-right">Stok Sesudah</th>
                    <th className="py-3 px-4 text-right">Total Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mutasiRows.map((m) => {
                    const mut = (m.mutasi as Record<string, unknown>) || {};
                    const brg = (m.barang as Record<string, unknown>) || {};
                    return (
                      <tr key={String(m.id)} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-500">
                          {mut.tanggal
                            ? new Date(String(mut.tanggal)).toLocaleDateString(
                                "id-ID"
                              )
                            : "—"}
                        </td>
                        <td className="py-2 px-4 uppercase font-bold">
                          {String(mut.jenis || "")}
                        </td>
                        <td className="py-2 px-4 font-medium">
                          [{String(brg.kode_barang)}] {String(brg.nama)}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {Number(m.stok_sebelum)}
                        </td>
                        <td className="py-2 px-4 text-right font-bold">
                          {Number(m.jumlah)}
                        </td>
                        <td className="py-2 px-4 text-right font-bold">
                          {Number(m.stok_sesudah)}
                        </td>
                        <td className="py-2 px-4 text-right">
                          Rp{" "}
                          {Number(m.total_harga || 0).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {previewTab === "piutang" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 uppercase">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">No. Nota</th>
                    <th className="py-3 px-4 text-right">Jumlah Kasbon</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {kasbonRows.map((k) => {
                    const plg = (k.pelanggan as Record<string, unknown>) || {};
                    const trx = (k.transaksi as Record<string, unknown>) || {};
                    return (
                      <tr key={String(k.id)} className="hover:bg-gray-50">
                        <td className="py-2 px-4 text-gray-500">
                          {new Date(
                            String(k.tanggal_pengajuan)
                          ).toLocaleDateString("id-ID")}
                        </td>
                        <td className="py-2 px-4 font-medium">
                          {String(plg.nama || "—")}
                        </td>
                        <td className="py-2 px-4 font-mono text-blue-600">
                          {String(trx.no_nota || "—")}
                        </td>
                        <td className="py-2 px-4 text-right font-bold">
                          Rp{" "}
                          {Number(k.jumlah_kasbon || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-2 px-4 uppercase font-semibold">
                          {String(k.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
