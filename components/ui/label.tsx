import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FormInputProps
  extends Omit<ComponentProps<"input">, "onKeyDown"> {
  label?: string;
  error?: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}

export function InputLabel({
  label,
  htmlFor,
  className,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1 block text-sm font-medium text-foreground", className)}
    >
      {label}
    </label>
  );
}

export function Input({
  id,
  className,
  ...props
}: Omit<ComponentProps<"input">, "onKeyDown">) {
  return (
    <input
      id={id}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  htmlFor,
  className,
  children,
}: {
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block text-sm font-medium text-foreground",
        className
      )}
    >
      {children}
    </label>
  );
}
