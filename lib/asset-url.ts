import { API_BASE_URL } from "@/lib/api";

export function resolveAssetUrl(value?: string | null): string | null {
  const rawValue = value?.trim();
  if (!rawValue) return null;

  if (
    rawValue.startsWith("http://") ||
    rawValue.startsWith("https://") ||
    rawValue.startsWith("blob:") ||
    rawValue.startsWith("data:")
  ) {
    return rawValue;
  }

  try {
    const apiOrigin = new URL(API_BASE_URL ?? "http://localhost").origin;
    const normalizedPath = rawValue.startsWith("/")
      ? rawValue
      : `/${rawValue.replace(/^storage\//, "storage/")}`;

    return new URL(normalizedPath, apiOrigin).toString();
  } catch {
    return rawValue.startsWith("/") ? rawValue : `/${rawValue}`;
  }
}
