import { api, useMocks } from "@/lib/api";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { AppConfig, NavItemKey, NavVisibility, UpdateAppConfigPayload } from "@/types/app-config";

export const defaultNavVisibility: NavVisibility = {
  dashboard: true,
  ventas_productos: true,
  cierres_caja: true,
  usuarios: true,
  sucursales: true,
  visitas_sitio: true
};

export const defaultAppConfig: AppConfig = {
  siteName: "SoulFit",
  browserTitle: "SoulFit",
  loginTitle: "Entrar a SoulFit",
  navTitle: "SoulFit",
  logoUrl: null,
  faviconUrl: null,
  navVisibility: defaultNavVisibility,
  version: "default"
};

const legacyNavKeyMap: Record<string, NavItemKey> = {
  product_sales: "ventas_productos",
  cash_closings: "cierres_caja",
  "cash-closings": "cierres_caja",
  users: "usuarios",
  sucursals: "sucursales",
  website_visits: "visitas_sitio"
};

function normalizeNavKey(key: string): NavItemKey | null {
  if (Object.prototype.hasOwnProperty.call(defaultNavVisibility, key)) {
    return key as NavItemKey;
  }

  return legacyNavKeyMap[key] ?? null;
}

function normalizeBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "visible", "activo", "yes", "si"].includes(normalized)) return true;
    if (["false", "0", "hidden", "oculto", "inactivo", "no"].includes(normalized)) return false;
  }

  return null;
}

export function normalizeNavVisibility(value: unknown): NavVisibility {
  const visibility: NavVisibility = { ...defaultNavVisibility };

  if (!value || typeof value !== "object") {
    return visibility;
  }

  for (const [key, rawValue] of Object.entries(value)) {
    const navKey = normalizeNavKey(key);
    const visible = normalizeBoolean(rawValue);

    if (navKey && visible !== null) {
      visibility[navKey] = visible;
    }
  }

  return visibility;
}

export function normalizeAppConfig(value: Partial<AppConfig> | null | undefined): AppConfig {
  return {
    siteName: value?.siteName?.trim() || defaultAppConfig.siteName,
    browserTitle: value?.browserTitle?.trim() || defaultAppConfig.browserTitle,
    loginTitle: value?.loginTitle?.trim() || defaultAppConfig.loginTitle,
    navTitle: value?.navTitle?.trim() || defaultAppConfig.navTitle,
    logoUrl: resolveAssetUrl(value?.logoUrl),
    faviconUrl: resolveAssetUrl(value?.faviconUrl),
    navVisibility: normalizeNavVisibility(value?.navVisibility),
    version: value?.version || defaultAppConfig.version
  };
}

function buildFormData(payload: UpdateAppConfigPayload) {
  const formData = new FormData();

  formData.append("siteName", payload.siteName);
  formData.append("browserTitle", payload.browserTitle);
  formData.append("loginTitle", payload.loginTitle);
  formData.append("navTitle", payload.navTitle);
  formData.append("navVisibility", JSON.stringify(payload.navVisibility));

  if (payload.logo) {
    formData.append("logo", payload.logo);
  }

  if (payload.favicon) {
    formData.append("favicon", payload.favicon);
  }

  return formData;
}

export const appConfigService = {
  async getPublic(): Promise<AppConfig> {
    if (useMocks) return defaultAppConfig;

    const { data } = await api.get<Partial<AppConfig>>("/config/public");
    return normalizeAppConfig(data);
  },

  async getAdmin(): Promise<AppConfig> {
    if (useMocks) return defaultAppConfig;

    const { data } = await api.get<Partial<AppConfig>>("/admin/configuration");
    return normalizeAppConfig(data);
  },

  async update(payload: UpdateAppConfigPayload): Promise<AppConfig> {
    if (useMocks) {
      return normalizeAppConfig({
        ...payload,
        logoUrl: payload.logo ? URL.createObjectURL(payload.logo) : defaultAppConfig.logoUrl,
        faviconUrl: payload.favicon ? URL.createObjectURL(payload.favicon) : defaultAppConfig.faviconUrl,
        version: Date.now().toString()
      });
    }

    const { data } = await api.post<Partial<AppConfig>>(
      "/admin/configuration",
      buildFormData(payload)
    );

    return normalizeAppConfig(data);
  }
};
