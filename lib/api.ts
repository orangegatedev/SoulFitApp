import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { sessionTimeoutService } from "@/services/session-timeout.service";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8"
  }
});

function isApiDebugEnabled() {
  if (process.env.NEXT_PUBLIC_API_DEBUG === "true") return true;
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem("soulfit-api-debug") === "true";
}

function resolveRequestUrl(config: InternalAxiosRequestConfig) {
  try {
    return new URL(config.url ?? "", config.baseURL).toString();
  } catch {
    return `${config.baseURL ?? ""}${config.url ?? ""}`;
  }
}

function logApiRequest(config: InternalAxiosRequestConfig) {
  if (!isApiDebugEnabled()) return;

  console.info("[SoulFit API] request", {
    method: config.method?.toUpperCase(),
    url: resolveRequestUrl(config),
    origin: typeof window !== "undefined" ? window.location.origin : "server"
  });
}

function isFormDataPayload(data: unknown) {
  return typeof FormData !== "undefined" && data instanceof FormData;
}

function removeContentType(headers: InternalAxiosRequestConfig["headers"]) {
  const maybeAxiosHeaders = headers as unknown as { delete?: (header: string) => unknown };

  if (typeof maybeAxiosHeaders.delete === "function") {
    maybeAxiosHeaders.delete("Content-Type");
    maybeAxiosHeaders.delete("content-type");
    return;
  }

  const mutableHeaders = headers as unknown as Record<string, unknown>;
  delete mutableHeaders["Content-Type"];
  delete mutableHeaders["content-type"];
}

function logApiError(error: AxiosError) {
  if (!isApiDebugEnabled()) return;

  console.error("[SoulFit API] error", {
    message: error.message,
    code: error.code,
    status: error.response?.status,
    url: error.config ? resolveRequestUrl(error.config) : API_BASE_URL,
    origin: typeof window !== "undefined" ? window.location.origin : "server",
    response: error.response?.data
  });
}

function readToken() {
  if (typeof window === "undefined") return null;

  const persisted = window.localStorage.getItem("soulfit-auth");
  if (!persisted) return null;

  try {
    const parsed = JSON.parse(persisted) as { state?: { token?: string } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  if (isFormDataPayload(config.data)) {
    removeContentType(config.headers);
  }

  logApiRequest(config);

  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;

    const method = config.method?.toLowerCase();
    const isImportantProcess = ["post", "put", "patch", "delete"].includes(method ?? "")
      && !config.url?.includes("/auth/heartbeat")
      && !config.url?.includes("/auth/logout");
    if (isImportantProcess) sessionTimeoutService.registerImportantProcess();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    logApiError(error);

    if (error.response?.status === 401 && typeof window !== "undefined") {
      const responseData = error.response.data as { code?: string; message?: string } | undefined;
      if (responseData?.code === "SESSION_IDLE_EXPIRED") {
        sessionTimeoutService.expireFromServer(responseData.message);
      } else {
        sessionTimeoutService.clearSessionData();
      }
      window.dispatchEvent(new Event("soulfit:unauthorized"));
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";
