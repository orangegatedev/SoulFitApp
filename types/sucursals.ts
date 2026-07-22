export type SucursalEstado = "Activa" | "Inactiva" | string;

export interface Sucursal {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ruc?: string;
  logo?: string | null;
  estado: SucursalEstado;
}

export interface SucursalApiResponse {
  id?: string | number;
  Id?: string | number;
  nombre?: string;
  Nombre?: string;
  direccion?: string;
  Direccion?: string;
  telefono?: string;
  Telefono?: string;
  ruc?: string;
  Ruc?: string;
  logo?: string | null;
  Logo?: string | null;
  estado?: string;
  Estado?: string;
}

export interface SucursalPayload {
  nombre: string;
  direccion?: string;
  telefono?: string;
  ruc?: string;
  estado: SucursalEstado;
  logo?: File | null;
}
