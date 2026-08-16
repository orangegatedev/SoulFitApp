"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useSucursals } from "@/hooks/use-sucursals";
import { canManageSuperAdminTarget, getAssignableRoles } from "@/lib/user-roles";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types/auth";
import type { CreateUserPayload, SystemUser } from "@/types/users";

function splitFallbackName(name?: string) {
  if (!name) return { nombres: "", apellidos: "" };

  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return { nombres: name.trim(), apellidos: "" };

  const lastNameStart = parts.length > 3 ? parts.length - 2 : parts.length - 1;
  return {
    nombres: parts.slice(0, lastNameStart).join(" "),
    apellidos: parts.slice(lastNameStart).join(" ")
  };
}

export function UserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  user?: SystemUser | null;
  onSubmit: (payload: CreateUserPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}) {
  const { data: sucursals = [], isLoading: isLoadingSucursals } = useSucursals();
  const currentRole = useAuthStore((state) => state.user?.role);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [sucursalId, setSucursalId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fallbackName = splitFallbackName(user?.name);
    setNombres(user?.nombres ?? fallbackName.nombres);
    setApellidos(user?.apellidos ?? fallbackName.apellidos);
    setEmail(user?.email ?? "");
    setRole(user?.role ?? "viewer");
    setSucursalId(user?.sucursalId ?? "");
    setPassword("");
  }, [user]);

  useEffect(() => {
    if (sucursalId || !user?.branch || !sucursals.length) return;

    const matchingSucursal = sucursals.find(
      (sucursal) => sucursal.nombre.toLowerCase() === user.branch?.toLowerCase()
    );
    setSucursalId(matchingSucursal?.id ?? "");
  }, [sucursalId, sucursals, user?.branch]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      nombres,
      apellidos,
      email,
      role,
      sucursalId: sucursalId || undefined,
      password: password || undefined
    });
  }

  const canManageTarget = canManageSuperAdminTarget(currentRole, user?.role);
  const availableRoles = getAssignableRoles(currentRole);
  const canSubmit = canManageTarget && availableRoles.some((option) => option.value === role);

  return (
    <form className="grid min-w-0 gap-4" onSubmit={handleSubmit}>
      {!canManageTarget ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          No tienes permisos para administrar usuarios SuperAdmin.
        </p>
      ) : null}
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="nombres">Nombres</Label>
          <Input
            id="nombres"
            value={nombres}
            onChange={(event) => setNombres(event.target.value)}
            required
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <Input
            id="apellidos"
            value={apellidos}
            onChange={(event) => setApellidos(event.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="role">Rol</Label>
          <Select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            disabled={!canManageTarget}
          >
            {availableRoles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="sucursalId">Sucursal</Label>
          <Select
            id="sucursalId"
            value={sucursalId}
            onChange={(event) => setSucursalId(event.target.value)}
            disabled={isLoadingSucursals || sucursals.length === 0}
            required
          >
            <option value="">
              {isLoadingSucursals ? "Cargando sucursales..." : "Selecciona una sucursal"}
            </option>
            {sucursals.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="password">{user ? "Nueva contraseña" : "Contraseña temporal"}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={user ? "Opcional" : "Opcional para mock/API"}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSubmitting || !canSubmit} className="w-full sm:w-auto">
          {isSubmitting ? "Guardando..." : user ? "Actualizar usuario" : "Crear usuario"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
