"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DEFAULT_REPORT_SUMMARY,
  downloadExcelCSV,
  muatDataLaporanSupabase,
  type PreviewTabLaporan,
  type ReportSummary,
} from "./layanan-laporan";

export function useLaporan() {
  const [dariTanggal, setDariTanggal] = useState("2026-01-01");
  const [sampaiTanggal, setSampaiTanggal] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary>(DEFAULT_REPORT_SUMMARY);
  const [previewTab, setPreviewTab] = useState<PreviewTabLaporan>("penjualan");
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
      const { trxs, brgs, muts, ksbs, summary: nextSummary } =
        await muatDataLaporanSupabase();
      setTrxRows(trxs);
      setBarangRows(brgs);
      setMutasiRows(muts);
      setKasbonRows(ksbs);
      setSummary(nextSummary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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
    downloadExcelCSV(
      "Laporan_Stok_dan_Daftar_Harga_CV_Kurnia_Mandiri",
      headers,
      rows
    );
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

  return {
    dariTanggal,
    setDariTanggal,
    sampaiTanggal,
    setSampaiTanggal,
    loading,
    summary,
    previewTab,
    setPreviewTab,
    trxRows,
    barangRows,
    mutasiRows,
    kasbonRows,
    fetchReportData,
    handleExportStokExcel,
    handleExportMutasiExcel,
    handleExportPenjualanExcel,
    handleExportPiutangExcel,
  };
}
