"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BULAN_PENDEK = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const BULAN_PANJANG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI_SINGKAT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function parseYMD(value: string): { year: number; month: number; day: number } {
  const parts = value.split("-").map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    return { year: parts[0], month: parts[1] - 1, day: parts[2] };
  }
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };
}

function toYMD(year: number, month: number, day: number): string {
  const y = String(year).padStart(4, "0");
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTanggalID(value: string): string {
  if (!value) return "Pilih tanggal";
  const { year, month, day } = parseYMD(value);
  return `${String(day).padStart(2, "0")} ${BULAN_PENDEK[month] || ""} ${year}`;
}

export interface CustomDatePickerProps {
  value: string;
  onChange: (nextValue: string) => void;
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  disabled,
}: CustomDatePickerProps) {
  const parsed = useMemo(() => parseYMD(value), [value]);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [parsed.year, parsed.month]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    // Konversi Minggu (0) -> 6, Senin (1) -> 0
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{
      year: number;
      month: number;
      day: number;
      inCurrentMonth: boolean;
    }> = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      cells.push({
        year: prevYear,
        month: prevMonth,
        day: daysInPrevMonth - i,
        inCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        year: viewYear,
        month: viewMonth,
        day: d,
        inCurrentMonth: true,
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({
        year: nextYear,
        month: nextMonth,
        day: d,
        inCurrentMonth: false,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayYMD = useMemo(() => {
    const now = new Date();
    return toYMD(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 text-left text-sm font-semibold text-[#1E293B] shadow-2xs transition-all cursor-pointer",
          open
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/15"
            : "border-[#CBD5E1] hover:border-[#94A3B8]",
          disabled && "cursor-not-allowed bg-[#F1F5F9] opacity-70"
        )}
      >
        <span className="inline-flex items-center gap-2.5 truncate">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="truncate">{formatTanggalID(value)}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200",
            open && "rotate-180 text-[#2563EB]"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="fixed inset-x-3 top-24 z-50 mx-auto w-[min(310px,calc(100vw-24px))] rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-[0_14px_34px_-6px_rgba(15,23,42,0.18)] sm:absolute sm:inset-x-auto sm:left-0 sm:top-[calc(100%+8px)] sm:mx-0 sm:w-[300px]">
          <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-[#F1F5F9]">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm font-bold text-[#1E293B]">
              {BULAN_PANJANG[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] hover:text-[#2563EB] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {HARI_SINGKAT.map((h) => (
              <span
                key={h}
                className="py-1 text-[11px] font-bold uppercase tracking-wider text-[#64748B]"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              const cellYMD = toYMD(cell.year, cell.month, cell.day);
              const isSelected = cellYMD === value;
              const isToday = cellYMD === todayYMD;
              return (
                <button
                  key={cellYMD}
                  type="button"
                  onClick={() => {
                    onChange(cellYMD);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-9 w-full rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center",
                    isSelected
                      ? "bg-[#2563EB] text-white font-bold shadow-xs"
                      : isToday
                        ? "border border-[#2563EB] text-[#2563EB] bg-[#EFF6FF]/50"
                        : cell.inCurrentMonth
                          ? "text-[#1E293B] hover:bg-[#F1F5F9]"
                          : "text-[#94A3B8] hover:bg-[#F8FAFC]"
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(toYMD(now.getFullYear(), 0, 1));
                setOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
            >
              Awal Tahun
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(toYMD(now.getFullYear(), now.getMonth(), 1));
                setOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] cursor-pointer"
            >
              Awal Bulan
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(todayYMD);
                setOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] cursor-pointer"
            >
              Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default CustomDatePicker;
