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
      return <IconComp className="w-4 h-4 shrink-0" />;
    }
    return <span className="shrink-0">{icon as ReactNode}</span>;
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-50 text-blue-600 font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        className
      )}
      {...props}
    >
      {renderIcon()}
      {children}
    </Link>
  );
}
export default NavLink;
