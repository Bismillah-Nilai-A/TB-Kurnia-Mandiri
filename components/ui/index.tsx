"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { Button } from "./button";
export { Input } from "./input";
export { Link as CustomLink } from "./link";
export { Switch } from "./switch";
export { SearchField } from "./search-field";
export { NavLink } from "./nav-link";
export { Card, CardHeader, CardTitle, CardContent } from "./card";
export { StatusBadge } from "./status-badge";
export { PageHeader } from "./page-header";
export { CustomSelect } from "./custom-select";
export { ResponsiveTabs } from "./responsive-tabs";
export { CustomDatePicker } from "./custom-date-picker";
export { TablePagination } from "./table-pagination";
import { CustomSelect as CustomSelectComp, type CustomSelectProps } from "./custom-select";

export function Tab({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-10 rounded-md px-3 py-1.5 text-base font-semibold transition-colors cursor-pointer",
        active
          ? "bg-white text-[#1D4ED8] shadow-sm"
          : "text-[#64748B] hover:text-[#1E293B]",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-base font-semibold leading-none text-[#1E293B] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
}

const FIELD =
  "flex w-full rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-base text-[#1E293B] placeholder:text-[#64748B] focus-visible:outline-none focus-visible:border-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB]/25 disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:opacity-70";

export function Select({
  className,
  children,
  ...props
}: CustomSelectProps) {
  return (
    <CustomSelectComp className={cn("w-full", className)} {...props}>
      {children}
    </CustomSelectComp>
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, "min-h-[96px]", className)} {...props} />;
}

export function Table({
  children,
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full caption-bottom text-base", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-[#F8FAFC]", className)} {...props}>
      {children}
    </thead>
  );
}

export function Trow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-[#E2E8F0]", className)} {...props}>
      {children}
    </tr>
  );
}

export function Th({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-base font-semibold text-[#64748B]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-base", className)} {...props}>
      {children}
    </td>
  );
}

export function Tag({
  children,
  color = "slate",
  className,
}: {
  children: ReactNode;
  color?: "slate" | "green" | "amber" | "red" | "blue" | "purple";
  className?: string;
}) {
  const map: Record<string, string> = {
    slate: "bg-[#F1F5F9] text-[#334155]",
    green: "bg-[#DCFCE7] text-[#15803D]",
    amber: "bg-[#FEF3C7] text-[#92400E]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
    blue: "bg-[#DBEAFE] text-[#1D4ED8]",
    purple: "bg-[#DBEAFE] text-[#1D4ED8]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-base font-semibold",
        map[color],
        className
      )}
    >
      {children}
    </span>
  );
}
