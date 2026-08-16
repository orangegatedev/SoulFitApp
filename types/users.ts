import type { UserRole } from "@/types/auth";

export interface SystemUser {
  id: string;
  name?: string;
  nombres?: string;
  apellidos?: string;
  email: string;
  role: UserRole;
  branch?: string;
  sucursalId?: string;
  active: boolean;
  accessRevoked: boolean;
  isOnline: boolean;
  lastSeenAt?: string;
  currentSessionSource?: string;
  appAccessEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UserFilterOption {
  value: string;
  label: string;
  email: string;
  role: UserRole;
  branchId: string | null;
}

export interface CreateUserPayload {
  nombres: string;
  apellidos: string;
  email: string;
  role: UserRole;
  sucursalId?: string;
  password?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {}

export interface UpdateUserStatusPayload {
  active?: boolean;
  accessRevoked?: boolean;
  appAccessEnabled?: boolean;
}
