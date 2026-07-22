import { api, useMocks } from "@/lib/api";
import { mockSucursals, mockUsers, replaceMockUsers } from "@/services/mock-data";
import type {
  CreateUserPayload,
  SystemUser,
  UpdateUserPayload,
  UpdateUserStatusPayload
} from "@/types/users";

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

type UserApiResponse = SystemUser & {
  Id?: string | number;
  Nombres?: string;
  Apellidos?: string;
  Email?: string;
  Correo?: string;
  Role?: string;
  Rol?: string;
  sucursal_id?: string | number;
  SucursalId?: string | number;
  IdSucursal?: string | number;
  Sucursal_Id?: string | number;
  branch?: string;
  Branch?: string;
  Sucursal?: string;
  active?: boolean;
  Activo?: boolean;
  Estado?: boolean | string;
  accessRevoked?: boolean;
  AccesoRevocado?: boolean;
  isOnline?: boolean;
  IsOnline?: boolean;
  online?: boolean;
  lastSeenAt?: string;
  LastSeenAt?: string;
  currentSessionSource?: string;
  CurrentSessionSource?: string;
  appAccessEnabled?: boolean;
  AppAccessEnabled?: boolean;
  createdAt?: string;
  CreatedAt?: string;
  sucursal?: { id?: string | number; Id?: string | number; nombre?: string; Nombre?: string };
};

type UsersListResponse =
  | UserApiResponse[]
  | ApiEnvelope<UserApiResponse[] | PaginatedResponse<UserApiResponse>>
  | PaginatedResponse<UserApiResponse>;

type UserResponse = UserApiResponse | ApiEnvelope<UserApiResponse>;

function getFullName(user: Pick<SystemUser, "name" | "nombres" | "apellidos">) {
  return user.name ?? [user.nombres, user.apellidos].filter(Boolean).join(" ");
}

function getBranchName(sucursalId?: string) {
  return mockSucursals.find((sucursal) => sucursal.id === sucursalId)?.nombre;
}

function normalizeRole(role?: string) {
  const normalizedRole = role?.trim().toLowerCase();
  if (
    normalizedRole === "admin" ||
    normalizedRole === "manager" ||
    normalizedRole === "cashier" ||
    normalizedRole === "viewer"
  ) {
    return normalizedRole;
  }

  if (normalizedRole === "cajero" || normalizedRole === "cajera") {
    return "cashier";
  }

  return "viewer";
}

function unwrapList(response: UsersListResponse) {
  if (Array.isArray(response)) return response;

  if (!response || typeof response !== "object") {
    throw new Error("La respuesta de usuarios no tiene formato JSON valido.");
  }

  const data = response.data;

  if (Array.isArray(data)) return data;

  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function isCashierRole(role?: string) {
  const normalizedRole = role?.trim().toLowerCase();
  return (
    normalizedRole === "cashier" ||
    normalizedRole === "cashiers" ||
    normalizedRole === "cajero" ||
    normalizedRole === "cajera" ||
    normalizedRole === "cajeros" ||
    normalizedRole === "cajeras"
  );
}

function unwrapItem(response: UserResponse) {
  return "data" in response ? response.data : response;
}

function normalizeUser(user: UserApiResponse): SystemUser {
  const sucursalId = String(
    user.sucursalId ??
      user.sucursal_id ??
      user.SucursalId ??
      user.IdSucursal ??
      user.Sucursal_Id ??
      user.sucursal?.id ??
      user.sucursal?.Id ??
      ""
  );
  const nombres = user.nombres ?? user.Nombres;
  const apellidos = user.apellidos ?? user.Apellidos;
  const role = normalizeRole(user.role ?? user.Role ?? user.Rol);
  const active =
    user.active ??
    user.Activo ??
    (typeof user.Estado === "string" ? user.Estado.toLowerCase() === "activo" : user.Estado) ??
    true;

  return {
    ...user,
    id: String(user.id ?? user.Id ?? ""),
    nombres,
    apellidos,
    name: user.name ?? [nombres, apellidos].filter(Boolean).join(" "),
    email: user.email ?? user.Email ?? user.Correo ?? "",
    role,
    sucursalId: sucursalId || undefined,
    branch:
      user.branch ??
      user.Branch ??
      user.Sucursal ??
      user.sucursal?.nombre ??
      user.sucursal?.Nombre ??
      getBranchName(sucursalId) ??
      undefined,
    active,
    accessRevoked: user.accessRevoked ?? user.AccesoRevocado ?? false,
    isOnline: user.isOnline ?? user.IsOnline ?? user.online ?? false,
    lastSeenAt: user.lastSeenAt ?? user.LastSeenAt,
    currentSessionSource: user.currentSessionSource ?? user.CurrentSessionSource,
    appAccessEnabled: user.appAccessEnabled ?? user.AppAccessEnabled ?? true,
    createdAt: user.createdAt ?? user.CreatedAt ?? ""
  };
}

function toApiPayload(payload: CreateUserPayload | UpdateUserPayload) {
  const name = [payload.nombres, payload.apellidos].filter(Boolean).join(" ").trim();
  const branchId = payload.sucursalId ? Number(payload.sucursalId) : undefined;

  return {
    name,
    nombres: payload.nombres,
    Nombres: payload.nombres,
    apellidos: payload.apellidos,
    Apellidos: payload.apellidos,
    email: payload.email,
    Email: payload.email,
    role: payload.role,
    Role: payload.role,
    Rol: payload.role,
    sucursalId: payload.sucursalId,
    SucursalId: payload.sucursalId,
    sucursal_id: payload.sucursalId,
    branch_id: branchId,
    branchId,
    branch: branchId ? { Id: branchId, id: branchId } : undefined,
    IdSucursal: branchId,
    Sucursal_Id: payload.sucursalId,
    password: payload.password,
    Password: payload.password
  };
}

export const usersService = {
  async getUsers(): Promise<SystemUser[]> {
    if (!useMocks) {
      const { data } = await api.get<UsersListResponse>("/users");
      return unwrapList(data).map(normalizeUser);
    }

    return [...mockUsers];
  },

  async searchCashiers(): Promise<SystemUser[]> {
    if (!useMocks) {
      const { data } = await api.get<UsersListResponse>("/users/search", {
        params: { q: "cajero" }
      });
      const users = unwrapList(data);
      const normalizedUsers = users.map(normalizeUser).filter((user) => user.id);
      const cashiers = normalizedUsers.filter((user, index) => {
        const rawUser = users[index];
        return isCashierRole(user.role) || isCashierRole(rawUser.role ?? rawUser.Role ?? rawUser.Rol);
      });

      return cashiers.length ? cashiers : normalizedUsers;
    }

    return mockUsers.filter((user) => user.role === "cashier");
  },

  async createUser(payload: CreateUserPayload): Promise<SystemUser> {
    if (!useMocks) {
      const { data } = await api.post<UserResponse>("/users", toApiPayload(payload));
      return normalizeUser(unwrapItem(data));
    }

    const user: SystemUser = {
      id: crypto.randomUUID(),
      nombres: payload.nombres,
      apellidos: payload.apellidos,
      name: getFullName(payload),
      email: payload.email,
      role: payload.role,
      branch: getBranchName(payload.sucursalId),
      sucursalId: payload.sucursalId,
      active: true,
      accessRevoked: false,
      isOnline: false,
      appAccessEnabled: true,
      createdAt: new Date().toISOString()
    };

    replaceMockUsers([user, ...mockUsers]);
    return user;
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<SystemUser> {
    if (!useMocks) {
      const { data } = await api.put<UserResponse>(`/users/${id}`, toApiPayload(payload));
      return normalizeUser(unwrapItem(data));
    }

    const users = mockUsers.map((user) =>
      user.id === id
        ? {
            ...user,
            ...payload,
            name: getFullName({ ...user, ...payload }),
            branch: getBranchName(payload.sucursalId) ?? user.branch
          }
        : user
    );
    replaceMockUsers(users);
    const updated = users.find((user) => user.id === id);
    if (!updated) throw new Error("Usuario no encontrado.");
    return updated;
  },

  async updateStatus(
    id: string,
    payload: UpdateUserStatusPayload
  ): Promise<SystemUser> {
    if (!useMocks) {
      const { data } = await api.patch<UserResponse>(`/users/${id}/status`, payload);
      return normalizeUser(unwrapItem(data));
    }

    const users = mockUsers.map((user) =>
      user.id === id ? { ...user, ...payload } : user
    );
    replaceMockUsers(users);
    const updated = users.find((user) => user.id === id);
    if (!updated) throw new Error("Usuario no encontrado.");
    return updated;
  }
};
