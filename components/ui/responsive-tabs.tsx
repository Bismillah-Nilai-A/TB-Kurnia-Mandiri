"use client";

import React from "react";
import { CustomSelect } from "./custom-select";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  activeColor?: "blue" | "red";
}

export interface ResponsiveTabsProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  "aria-label"?: string;
  className?: string;
  mobileClassName?: string;
}

/**
 * Pada layar desktop (>= 1024px / lg) tampil sebagai bar tab menyatu.
 * Pada layar kecil (mobile 4-7 inci, phablet, tablet/iPad < 1024px) otomatis berubah menjadi CustomSelect dropdown agar tidak menumpuk seperti tangga.
 */
export function ResponsiveTabs<T extends string = string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel = "Pilih tampilan",
  className = "",
  mobileClassName = "w-full sm:w-64",
}: ResponsiveTabsProps<T>) {
  return (
    <>
      {/* Tampilan Mobile & Tablet (< lg): Dropdown CustomSelect */}
      <div className={cn("block lg:hidden print:hidden", mobileClassName)}>
        <CustomSelect
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-label={ariaLabel}
          className="w-full"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </CustomSelect>
      </div>

      {/* Tampilan Desktop (>= lg): Bar Segmented Menyatu */}
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          "hidden lg:inline-flex items-center rounded-xl border border-[#CBD5E1] bg-white p-1 w-fit print:hidden",
          className
        )}
      >
        {options.map((opt) => {
          const isActive = opt.id === value;
          const Icon = opt.icon;
          const activeBg =
            opt.activeColor === "red" ? "bg-[#DC2626]" : "bg-[#2563EB]";

          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex min-h-10 items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                isActive
                  ? `${activeBg} text-white shadow-xs`
                  : "text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC]"
              )}
            >
              {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default ResponsiveTabs;
