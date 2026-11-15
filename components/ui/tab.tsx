"use client";

import { cn } from "@/components/ui";
import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="border-border/60 bg-muted/40">{children}</thead>;
}

export function Trow({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border/40", className)}>{children}</tr>;
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-2 text-sm", className)}>{children}</td>
  );
}
