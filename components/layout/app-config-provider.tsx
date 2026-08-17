"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  appConfigService,
  defaultAppConfig,
  normalizeAppConfig
} from "@/services/app-config.service";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { AppConfig } from "@/types/app-config";

const STORAGE_KEY = "soulfit-app-config";

interface AppConfigContextValue {
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
  setConfig: (config: AppConfig) => void;
  refresh: () => Promise<AppConfig>;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

function readCachedConfig(): AppConfig {
  if (typeof window === "undefined") return defaultAppConfig;

  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (!cached) return defaultAppConfig;

  try {
    return normalizeAppConfig(JSON.parse(cached));
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultAppConfig;
  }
}

function cacheConfig(config: AppConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function applyDocumentBranding(config: AppConfig) {
  if (typeof document === "undefined") return;

  document.title = config.browserTitle || defaultAppConfig.browserTitle;

  const fallbackFaviconUrl = "/icons/icon-192.png";
  const faviconUrl = resolveAssetUrl(config.faviconUrl) || fallbackFaviconUrl;
  const versionedFaviconUrl =
    faviconUrl.startsWith("blob:") || faviconUrl.startsWith("data:") || faviconUrl.includes("?")
      ? faviconUrl
      : `${faviconUrl}?v=${encodeURIComponent(config.version)}`;

  document
    .querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']")
    .forEach((element) => element.remove());

  for (const rel of ["icon", "shortcut icon"]) {
    const icon = document.createElement("link");
    icon.rel = rel;
    icon.href = versionedFaviconUrl;
    icon.type = faviconUrl.endsWith(".ico") || faviconUrl.includes(".ico?") ? "image/x-icon" : "image/png";
    icon.setAttribute("data-soulfit-favicon", config.faviconUrl ? "dynamic" : "fallback");
    document.head.appendChild(icon);
  }
}

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<AppConfig>(defaultAppConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setConfig = useCallback((nextConfig: AppConfig) => {
    setConfigState(nextConfig);
    cacheConfig(nextConfig);
    applyDocumentBranding(nextConfig);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextConfig = await appConfigService.getPublic();
      setConfig(nextConfig);
      return nextConfig;
    } catch (exception) {
      const fallbackConfig = readCachedConfig();
      setError(exception instanceof Error ? exception.message : "No fue posible cargar la configuracion.");
      applyDocumentBranding(fallbackConfig);
      return fallbackConfig;
    } finally {
      setIsLoading(false);
    }
  }, [setConfig]);

  useEffect(() => {
    let active = true;
    const cachedConfig = readCachedConfig();

    setConfig(cachedConfig);
    setIsLoading(false);

    async function loadPublicConfig() {
      try {
        const nextConfig = await appConfigService.getPublic();
        if (!active) return;
        setError(null);
        setConfig(nextConfig);
      } catch (exception) {
        if (!active) return;
        setError(exception instanceof Error ? exception.message : "No fue posible cargar la configuracion.");
        applyDocumentBranding(cachedConfig);
      }
    }

    void loadPublicConfig();

    return () => {
      active = false;
    };
  }, [setConfig]);

  const value = useMemo<AppConfigContextValue>(
    () => ({
      config,
      isLoading,
      error,
      setConfig,
      refresh
    }),
    [config, error, isLoading, refresh, setConfig]
  );

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (!context) {
    throw new Error("useAppConfig debe usarse dentro de AppConfigProvider");
  }

  return context;
}
