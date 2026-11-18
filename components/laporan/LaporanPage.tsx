"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Label,
  ResponsiveTabs,
  CustomDatePicker,
} from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import {
  Download,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  ArrowDownToLine,
} from "lucide-react";
import { useLaporan } from "./use-laporan";
import { TabelPratinjauLaporan } from "./komponen/TabelPratinjauLaporan";

export function LaporanPage() {
  const {
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
  } = useLaporan();

  const [csvMenuOpen, setCsvMenuOpen] = useState(false);
  const csvMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!csvMenuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (
        csvMenuRef.current &&
        !csvMenuRef.current.contains(e.target as Node)
      ) {
        setCsvMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCsvMenuOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      window.removeEventListener("keydown", onKey);
    };
  }, [csvMenuOpen]);

  const csvOptions = [
    {
      id: "stok",
      label: "CSV Stok",
      subtitle: `Daftar harga & stok (${barangRows.length} barang)`,
      icon: FileSpreadsheet,
      onClick: handleExportStokExcel,
    },
    {
      id: "mutasi",
      label: "CSV Mutasi",
      subtitle: `Riwayat keluar masuk (${mutasiRows.length} data)`,
      icon: FileSpreadsheet,
      onClick: handleExportMutasiExcel,
    },
    {
      id: "penjualan",
      label: "CSV Penjualan",
      subtitle: `Rekap nota penjualan (${trxRows.length} nota)`,
      icon: Download,
      onClick: handleExportPenjualanExcel,
    },
    {
      id: "piutang",
      label: "CSV Piutang",
      subtitle: `Data kasbon pelanggan (${kasbonRows.length} data)`,
      icon: Download,
      onClick: handleExportPiutangExcel,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        crumbs={[{ label: "Laporan & Sistem" }, { label: "Laporan" }]}
        title="Laporan"
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </Button>
        }
      />

      <Card className="print:hidden">
        <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
          {/* Baris 1: Filter Rentang Tanggal (Responsif Penuh di Dalam Kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] items-end gap-3 w-full">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label>Dari Tanggal</Label>
              <CustomDatePicker
                value={dariTanggal}
                onChange={setDariTanggal}
                aria-label="Dari tanggal laporan"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label>Sampai Tanggal</Label>
              <CustomDatePicker
                value={sampaiTanggal}
                onChange={setSampaiTanggal}
                aria-label="Sampai tanggal laporan"
              />
            </div>
            <Button
              onClick={fetchReportData}
              disabled={loading}
              className="w-full sm:w-auto px-5"
            >
              Terapkan Periode
            </Button>
          </div>

          {/* Baris 2: Ekspor Laporan CSV (1 Dropdown di Mobile, 1 Baris Grid 4 Kolom Rata di Tablet/iPad/Desktop) */}
          <div className="pt-3.5 border-t border-[#E2E8F0] w-full">
            {/* Tampilan Mobile (< 640px): Satu Tombol Menu Dropdown */}
            <div ref={csvMenuRef} className="relative sm:hidden">
              <button
                type="button"
                onClick={() => setCsvMenuOpen((v) => !v)}
                aria-expanded={csvMenuOpen}
                aria-label="Menu unduh laporan CSV"
                className="flex h-11 w-full items-center justify-between gap-2.5 rounded-xl border border-[#CBD5E1] bg-white px-3.5 text-sm font-bold text-[#1E293B] shadow-2xs transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 cursor-pointer"
              >
                <span className="inline-flex items-center gap-2.5 truncate">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <span className="truncate">Unduh Laporan CSV</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 ${
                    csvMenuOpen ? "rotate-180 text-[#2563EB]" : ""
                  }`}
                />
              </button>

              {csvMenuOpen && (
                <div className="absolute right-0 left-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-[0_14px_34px_-6px_rgba(15,23,42,0.18)]">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Pilih Format CSV Excel
                  </div>
                  <div className="flex flex-col gap-1">
                    {csvOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            opt.onClick();
                            setCsvMenuOpen(false);
                          }}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#EFF6FF] group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#2563EB] group-hover:bg-white">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#1E293B] group-hover:text-[#1D4ED8] truncate">
                                {opt.label}
                              </p>
                              <p className="text-[11px] text-[#64748B] truncate">
                                {opt.subtitle}
                              </p>
                            </div>
                          </div>
                          <ArrowDownToLine className="h-4 w-4 shrink-0 text-[#64748B] group-hover:text-[#2563EB]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Tampilan Tablet, iPad & Desktop (>= 640px): 1 Baris Grid 4 Kolom Sama Lebar di Dalam Kartu */}
            <div className="hidden sm:grid sm:grid-cols-4 gap-2.5 w-full">
              {csvOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={opt.onClick}
                    className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-3 text-xs font-bold text-[#1E293B] shadow-2xs transition-all hover:border-[#2563EB] hover:bg-[#EFF6FF]/50 hover:text-[#1D4ED8] whitespace-nowrap cursor-pointer group"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">Total Penjualan</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            Rp {summary.totalPenjualan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Piutang Belum Lunas
          </p>
          <p className="text-xl font-bold text-red-600 mt-1">
            Rp {summary.totalPiutang.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Nilai Persediaan (Modal)
          </p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            Rp {summary.nilaiStokModal.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="km-card p-5">
          <p className="text-xs font-semibold text-gray-500">
            Estimasi Nilai Jual
          </p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            Rp {summary.nilaiStokJual.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <ResponsiveTabs
        value={previewTab}
        onChange={(v) => setPreviewTab(v)}
        aria-label="Pilih pratinjau laporan"
        options={[
          { id: "penjualan", label: `Penjualan (${trxRows.length})` },
          { id: "stok", label: `Stok & Harga (${barangRows.length})` },
          { id: "mutasi", label: `Keluar Masuk (${mutasiRows.length})` },
          { id: "piutang", label: `Kasbon (${kasbonRows.length})` },
        ]}
      />

      <TabelPratinjauLaporan
        previewTab={previewTab}
        trxRows={trxRows}
        barangRows={barangRows}
        mutasiRows={mutasiRows}
        kasbonRows={kasbonRows}
      />
    </div>
  );
}
