import { api, useMocks } from "@/lib/api";
import { mockSucursals, replaceMockSucursals } from "@/services/mock-data";
import type { Sucursal, SucursalApiResponse, SucursalPayload } from "@/types/sucursals";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type PaginatedResponse<T> = {
  current_page?: number;
  data: T[];
  total?: number;
};

type SucursalsListResponse =
  | SucursalApiResponse[]
  | ApiEnvelope<SucursalApiResponse[] | PaginatedResponse<SucursalApiResponse>>
  | PaginatedResponse<SucursalApiResponse>;
type SucursalResponse = SucursalApiResponse | ApiEnvelope<SucursalApiResponse>;
type SucursalLogoResponse =
  | string
  | null
  | {
      logo?: string | null;
      Logo?: string | null;
      data?: string | null | { logo?: string | null; Logo?: string | null };
    };

function unwrapList(response: SucursalsListResponse) {
  if (Array.isArray(response)) return response;

  const data = response.data;

  if (Array.isArray(data)) return data;

  return data.data;
}

function unwrapItem(response: SucursalResponse) {
  return "data" in response ? response.data : response;
}

function normalizeSucursal(item: SucursalApiResponse): Sucursal {
  return {
    id: String(item.id ?? item.Id ?? ""),
    nombre: item.nombre ?? item.Nombre ?? "",
    direccion: item.direccion ?? item.Direccion ?? undefined,
    telefono: item.telefono ?? item.Telefono ?? undefined,
    ruc: item.ruc ?? item.Ruc ?? undefined,
    logo: item.logo ?? item.Logo ?? null,
    estado: item.estado ?? item.Estado ?? "Activa"
  };
}

function normalizeLogo(response: SucursalLogoResponse) {
  const logo =
    typeof response === "string"
      ? response
      : typeof response?.data === "string"
        ? response.data
        : response?.data?.logo ?? response?.data?.Logo ?? response?.logo ?? response?.Logo ?? null;

  if (!logo) return null;

  return logo.startsWith("data:") ? logo : `data:image/jpeg;base64,${logo}`;
}

function toJsonPayload(payload: SucursalPayload) {
  return {
    nombre: payload.nombre,
    direccion: payload.direccion,
    telefono: payload.telefono,
    ruc: payload.ruc,
    estado: payload.estado
  };
}

function toFormData(payload: SucursalPayload, method?: "PUT") {
  const formData = new FormData();

  formData.append("nombre", payload.nombre);
  formData.append("estado", payload.estado);

  if (payload.direccion) formData.append("direccion", payload.direccion);
  if (payload.telefono) formData.append("telefono", payload.telefono);
  if (payload.ruc) formData.append("ruc", payload.ruc);
  if (payload.logo) {
    formData.append("Logo", payload.logo);
  }
  if (method) formData.append("_method", method);

  return formData;
}

function hasLogo(payload: SucursalPayload) {
  return typeof File !== "undefined" && payload.logo instanceof File;
}

export const sucursalsService = {
  async getLogo(): Promise<string | null> {
    if (!useMocks) {
      const { data } = await api.get<SucursalLogoResponse>("/sucursals/logo");
      return normalizeLogo(data);
    }

    return normalizeLogo(mockSucursals.find((sucursal) => sucursal.logo)?.logo ?? null);
  },

  async getSucursals(): Promise<Sucursal[]> {
    if (!useMocks) {
      const { data } = await api.get<SucursalsListResponse>("/sucursals");
      return unwrapList(data).map(normalizeSucursal);
    }

    return [...mockSucursals];
  },

  async createSucursal(payload: SucursalPayload): Promise<Sucursal> {
    if (!useMocks) {
      const requestPayload = hasLogo(payload) ? toFormData(payload) : toJsonPayload(payload);
      const { data } = await api.post<SucursalResponse>("/sucursals", requestPayload);
      return normalizeSucursal(unwrapItem(data));
    }

    const sucursal: Sucursal = {
      id: crypto.randomUUID(),
      nombre: payload.nombre,
      direccion: payload.direccion,
      telefono: payload.telefono,
      ruc: payload.ruc,
      logo: payload.logo?.name ?? null,
      estado: payload.estado
    };

    replaceMockSucursals([sucursal, ...mockSucursals]);
    return sucursal;
  },

  async updateSucursal(id: string, payload: SucursalPayload): Promise<Sucursal> {
    if (!useMocks) {
      const { data } = hasLogo(payload)
        ? await api.post<SucursalResponse>(`/sucursals/${id}`, toFormData(payload, "PUT"))
        : await api.put<SucursalResponse>(`/sucursals/${id}`, toJsonPayload(payload));
      return normalizeSucursal(unwrapItem(data));
    }

    const sucursals = mockSucursals.map((sucursal) =>
      sucursal.id === id
        ? { ...sucursal, ...payload, logo: payload.logo?.name ?? sucursal.logo }
        : sucursal
    );
    replaceMockSucursals(sucursals);
    const updated = sucursals.find((sucursal) => sucursal.id === id);
    if (!updated) throw new Error("Sucursal no encontrada.");
    return updated;
  },

  async updateSucursalStatus(id: string, estado: string): Promise<Sucursal> {
    if (!useMocks) {
      const { data } = await api.patch<SucursalResponse>(`/sucursals/${id}`, { estado });
      return normalizeSucursal(unwrapItem(data));
    }

    const sucursals = mockSucursals.map((sucursal) =>
      sucursal.id === id ? { ...sucursal, estado } : sucursal
    );
    replaceMockSucursals(sucursals);
    const updated = sucursals.find((sucursal) => sucursal.id === id);
    if (!updated) throw new Error("Sucursal no encontrada.");
    return updated;
  },

  async deleteSucursal(id: string): Promise<void> {
    if (!useMocks) {
      await api.delete(`/sucursals/${id}`);
      return;
    }

    replaceMockSucursals(mockSucursals.filter((sucursal) => sucursal.id !== id));
  }
};
