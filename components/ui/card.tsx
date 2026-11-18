import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Kartu gaya Dashbyte: tanpa garis, sudut 6px, bayangan berlapis tipis.
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("km-card text-card-foreground", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1 border-b border-gray-200/70 px-5 py-4", className)}>
      {children}
    </div>
  );
}

// Judul kartu 22px
export function CardTitle({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-xl font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
