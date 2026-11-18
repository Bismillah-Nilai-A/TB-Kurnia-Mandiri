import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    // Satu tombol utama biru per layar; sisanya garis tepi atau polos.
    const variants = {
      default: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF]",
      ghost: "text-[#1D4ED8] hover:bg-[#EFF6FF]",
      destructive: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
      outline:
        "border border-[#CBD5E1] bg-white text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#94A3B8]",
      secondary: "bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0]",
    };
    const sizes = {
      default: "h-11 px-4",
      sm: "h-10 px-3",
      lg: "h-12 px-6",
      icon: "h-10 w-10",
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(base, variants[variant], sizes[size], className, (children.props as any)?.className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
