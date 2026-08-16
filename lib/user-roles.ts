import type { UserRole } from "@/types/auth";

export type UserRoleOption = {
  value: UserRole;
  label: string;
};

export const userRoleOptions: UserRoleOption[] = [
  { value: "superadmin", label: "SuperAdmin" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Gerente" },
  { value: "cashier", label: "Cajero" },
  { value: "viewer", label: "Visualizador" }
];

export const roleLabels: Record<UserRole, string> = {
  superadmin: "SuperAdmin",
  admin: "Admin",
  manager: "Gerente",
  cashier: "Cajero",
  viewer: "Visualizador"
};

export function isSuperAdminRole(role?: UserRole | null) {
  return role === "superadmin";
}

export function getAssignableRoles(currentUserRole?: UserRole | null, roles = userRoleOptions) {
  if (isSuperAdminRole(currentUserRole)) {
    return roles;
  }

  return roles.filter((role) => !isSuperAdminRole(role.value));
}

export function canManageSuperAdminTarget(
  currentUserRole?: UserRole | null,
  targetUserRole?: UserRole | null
) {
  return !isSuperAdminRole(targetUserRole) || isSuperAdminRole(currentUserRole);
}
