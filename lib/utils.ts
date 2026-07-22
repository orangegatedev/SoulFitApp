import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-NI").format(value);
}

export function formatDate(value?: string | Date | null, fallback = "Sin fecha") {
  if (value == null || (typeof value === "string" && value.trim() === "")) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("es-NI", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}
