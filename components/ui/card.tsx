import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { Fragment } from "react";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("p-5 pt-0", className)}>{children}</div>;
}
