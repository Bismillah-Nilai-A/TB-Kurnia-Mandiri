"use client";

import { useState, useEffect, useId } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { cn } from "@/lib/utils";

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = "data",
  className,
}: TablePaginationProps) {
  const jumpInputId = useId();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const [jumpVal, setJumpVal] = useState(String(safePage));

  useEffect(() => {
    setJumpVal(String(safePage));
  }, [safePage]);

  if (totalItems <= 0) return null;

  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  const getPageNumbers = (): Array<number | "ellipsis-start" | "ellipsis-end"> => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
    if (safePage > 3) pages.push("ellipsis-start");

    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }

    if (safePage < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
    return pages;
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(jumpVal);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      const targetPage = Math.min(Math.max(1, Math.floor(parsed)), totalPages);
      onPageChange(targetPage);
      setJumpVal(String(targetPage));
    } else {
      setJumpVal(String(safePage));
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]/60 print:hidden",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 text-xs text-[#64748B]">
        <span>
          Menampilkan{" "}
          <strong className="font-bold text-[#1E293B]">
            {startItem}-{endItem}
          </strong>{" "}
          dari{" "}
          <strong className="font-bold text-[#1E293B]">{totalItems}</strong>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && totalItems > Math.min(...pageSizeOptions) && (
          <CustomSelect
            value={String(pageSize)}
            placement="top"
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            aria-label="Jumlah baris per halaman"
            className="w-28"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / hal
              </option>
            ))}
          </CustomSelect>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              aria-label="Halaman sebelumnya"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#1E293B] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </button>

            {/* Indikator ringkas di layar mobile (< 640px) */}
            <span className="sm:hidden px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-[#1E293B]">
              Hal {safePage} / {totalPages}
            </span>

            {/* Nomor halaman di layar tablet & desktop (>= 640px) */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((p) =>
                typeof p === "string" ? (
                  <span
                    key={p}
                    className="px-1.5 text-xs font-semibold text-[#64748B]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p)}
                    aria-label={`Halaman ${p}`}
                    aria-current={p === safePage ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-xs font-bold transition-colors cursor-pointer",
                      p === safePage
                        ? "bg-[#2563EB] text-white shadow-2xs"
                        : "border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9]"
                    )}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
              aria-label="Halaman berikutnya"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-semibold text-[#1E293B] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Input lompat halaman khusus jika total data > 100 */}
          {totalItems > 100 && (
            <form
              onSubmit={handleJumpSubmit}
              className="inline-flex items-center gap-1.5 pl-0 sm:pl-2 sm:border-l sm:border-[#E2E8F0]"
            >
              <label
                htmlFor={jumpInputId}
                className="text-xs font-semibold text-[#64748B] whitespace-nowrap"
              >
                Ke hal:
              </label>
              <input
                id={jumpInputId}
                type="number"
                min={1}
                max={totalPages}
                value={jumpVal}
                onChange={(e) => setJumpVal(e.target.value)}
                aria-label={`Pindah ke halaman (1 sampai ${totalPages})`}
                className="h-9 w-14 rounded-lg border border-[#CBD5E1] bg-white px-2 text-center text-xs font-bold text-[#1E293B] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-2.5 text-xs font-bold text-[#2563EB] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
              >
                Buka
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
export default TablePagination;
