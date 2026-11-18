"use client";

import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: ReactNode | React.ComponentType<{ className?: string }>;
  active?: boolean;
  className?: string;
  children: ReactNode;
}

// Menu sidebar gaya Dashbyte: ikon + tulisan, menu aktif ditandai warna,
// tebal huruf, latar biru muda, dan garis kiri.
export function NavLink({
  href,
  icon,
  active: activeProp,
  className,
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const active =
    activeProp ??
    (pathname === href ||
      (href !== "/" && href !== "/dashboard" && pathname.startsWith(href)));

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as object))) {
      const IconComp = icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="h-5 w-5 shrink-0" />;
    }
    return <span className="shrink-0">{icon as ReactNode}</span>;
  };

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-base transition-colors",
        active
          ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[#2563EB]"
          : "font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#1E293B]",
        className
      )}
      {...props}
    >
      {renderIcon()}
      <span className="truncate">{children}</span>
    </Link>
  );
}
export default NavLink;
