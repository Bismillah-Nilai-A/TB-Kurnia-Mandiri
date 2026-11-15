import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function routePath(...parts: string[]) {
  return parts.map((p) => p.replace(/[^a-z0-9-_]/gi, "")).join("/");
}
