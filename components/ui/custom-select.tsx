"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

function extractOptions(children: React.ReactNode): OptionItem[] {
  const result: OptionItem[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      const fragProps = child.props as { children?: React.ReactNode };
      result.push(...extractOptions(fragProps.children));
      return;
    }
    if (child.type === "option") {
      const props = child.props as {
        value?: string | number;
        disabled?: boolean;
        children?: React.ReactNode;
      };
      const label = React.Children.toArray(props.children)
        .map((c) =>
          typeof c === "string" || typeof c === "number" ? String(c) : ""
        )
        .join("")
        .trim();
      const val = props.value !== undefined ? String(props.value) : label;
      result.push({
        value: val,
        label: label || val,
        disabled: props.disabled,
      });
    }
  });
  return result;
}

export interface CustomSelectProps {
  id?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
  placement?: "bottom" | "top";
  "aria-label"?: string;
  children?: React.ReactNode;
}

export function CustomSelect({
  id,
  value,
  defaultValue,
  onChange,
  disabled = false,
  className = "",
  placement = "bottom",
  "aria-label": ariaLabel,
  children,
}: CustomSelectProps) {
  const options = extractOptions(children);
  const [internalVal, setInternalVal] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : options[0]?.value ?? ""
  );
  const currentValue = value !== undefined ? String(value) : internalVal;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((o) => o.value === currentValue) || options[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (val: string) => {
    if (value === undefined) {
      setInternalVal(val);
    }
    if (onChange) {
      const syntheticEvent = {
        target: { value: val },
        currentTarget: { value: val },
      } as unknown as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative shrink-0", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2.5 rounded-lg border bg-white px-3.5 py-2 text-left text-xs font-semibold text-[#1E293B] transition-all duration-150 focus:outline-none focus-visible:outline-none",
          open
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
            : "border-[#CBD5E1] hover:border-[#94A3B8]",
          disabled
            ? "opacity-60 cursor-not-allowed bg-[#F8FAFC]"
            : "cursor-pointer"
        )}
      >
        <span className="truncate">{selectedOption?.label ?? "Pilih..."}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200",
            open && "rotate-180 text-[#2563EB]"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute left-0 z-50 min-w-full w-max max-w-[calc(100vw-24px)] max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl",
            placement === "top"
              ? "bottom-[calc(100%+6px)]"
              : "top-[calc(100%+6px)]"
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors focus:outline-none",
                  isSelected
                    ? "bg-[#EFF6FF] font-semibold text-[#1D4ED8]"
                    : "font-medium text-[#334155] hover:bg-[#F1F5F9] hover:text-[#1E293B]",
                  opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className="h-4 w-4 shrink-0 text-[#2563EB]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
