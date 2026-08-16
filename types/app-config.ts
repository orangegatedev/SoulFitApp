export type NavItemKey =
  | "dashboard"
  | "ventas_productos"
  | "cierres_caja"
  | "usuarios"
  | "sucursales"
  | "visitas_sitio";

export type NavVisibility = Record<NavItemKey, boolean>;

export interface AppConfig {
  siteName: string;
  browserTitle: string;
  loginTitle: string;
  navTitle: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  navVisibility: NavVisibility;
  version: string;
}

export interface UpdateAppConfigPayload {
  siteName: string;
  browserTitle: string;
  loginTitle: string;
  navTitle: string;
  navVisibility: NavVisibility;
  logo?: File | null;
  favicon?: File | null;
}
