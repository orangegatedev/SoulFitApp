"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Circle, Pencil, Plus, Power, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/forms/user-form";
import {
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
  useUsers
} from "@/hooks/use-users";
import { useSucursals } from "@/hooks/use-sucursals";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTopbarSearchStore } from "@/stores/topbar-search-store";
import type { CreateUserPayload, SystemUser } from "@/types/users";

const roleLabels: Record<SystemUser["role"], string> = {
  admin: "Admin",
  manager: "Gerente",
  cashier: "Cajero",
  viewer: "Visualizador"
};

function getUserName(user: SystemUser) {
  return user.name ?? [user.nombres, user.apellidos].filter(Boolean).join(" ");
}

function normalizeSearchText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getUserStatusLabel(user: SystemUser) {
  if (user.accessRevoked) return "Acceso cortado";
  return user.active ? "Activo" : "Inactivo";
}

function getOnlineLabel(user: SystemUser) {
  if (user.isOnline) {
    return `En linea - ${getSessionSourceLabel(user)}`;
  }

  return user.lastSeenAt ? `Desconectado - ${formatDate(user.lastSeenAt)}` : "Desconectado";
}

function getSessionSourceLabel(user: SystemUser) {
  const source = (user.currentSessionSource ?? "").trim().toLowerCase();

  if (source === "desktop" || source === "desktop-api") {
    return "Terminal de escritorio";
  }

  if (source === "mobile" || source === "app" || source === "web") {
    return "App";
  }

  return user.isOnline ? "App" : "Sin sesión activa";
}

function getSessionSourceBadge(user: SystemUser) {
  const label = getSessionSourceLabel(user);

  if (!user.isOnline) {
    return {
      label,
      className: "border-white/10 bg-white/5 text-zinc-400"
    };
  }

  if (label === "Terminal de escritorio") {
    return {
      label,
      className: "border-red-400/30 bg-red-500/10 text-red-100"
    };
  }

  return {
    label,
    className: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100"
  };
}

function getAppAccessLabel(user: SystemUser) {
  if (user.role !== "cashier") return "No aplica";
  return user.appAccessEnabled ? "App permitida" : "App bloqueada";
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return null;

  const response = "response" in error ? error.response : undefined;

  if (response && typeof response === "object" && "data" in response) {
    const data = response.data;

    if (data && typeof data === "object") {
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }

      if ("errors" in data && data.errors && typeof data.errors === "object") {
        return Object.values(data.errors)
          .flat()
          .filter((message): message is string => typeof message === "string")
          .join(" ");
      }
    }
  }

  return error instanceof Error ? error.message : "No fue posible guardar el usuario.";
}

export function UsersManagement() {
  const { data, isLoading, isError } = useUsers();
  const { data: sucursals = [] } = useSucursals();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const updateStatus = useUpdateUserStatus();
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const canManageCashierSettings = currentUser?.role !== "cashier";
  const searchQuery = useTopbarSearchStore((state) => state.queries.users);
  const sucursalNameById = useMemo(
    () => new Map(sucursals.map((sucursal) => [sucursal.id, sucursal.nombre])),
    [sucursals]
  );
  const filteredUsers = useMemo(() => {
    const search = normalizeSearchText(searchQuery.trim());
    const users = data ?? [];

    if (!search) return users;

    return users.filter((user) => {
      const branchName = user.sucursalId
        ? sucursalNameById.get(user.sucursalId) ?? user.branch
        : user.branch ?? "Todas";
      const searchableText = [
        getUserName(user),
        user.nombres,
        user.apellidos,
        user.email,
        user.role,
        roleLabels[user.role],
        branchName,
        getUserStatusLabel(user),
        getOnlineLabel(user),
        getSessionSourceLabel(user),
        getAppAccessLabel(user)
      ]
        .map(normalizeSearchText)
        .join(" ");

      return searchableText.includes(search);
    });
  }, [data, searchQuery, sucursalNameById]);
  const formError = getErrorMessage(editingUser ? updateUser.error : createUser.error);

  function handleSubmit(payload: CreateUserPayload) {
    createUser.reset();
    updateUser.reset();

    if (editingUser) {
      updateUser.mutate(
        { id: editingUser.id, payload },
        {
          onSuccess: () => {
            setEditingUser(null);
            setShowForm(false);
          }
        }
      );
      return;
    }

    createUser.mutate(payload, {
      onSuccess: () => setShowForm(false)
    });
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
            Seguridad
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Gestion de usuarios
          </h1>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            createUser.reset();
            updateUser.reset();
            setEditingUser(null);
            setShowForm((value) => !value);
          }}
        >
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {showForm ? (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>{editingUser ? "Editar usuario" : "Crear usuario"}</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {formError ? (
              <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {formError}
              </p>
            ) : null}
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={() => {
                createUser.reset();
                updateUser.reset();
                setShowForm(false);
                setEditingUser(null);
              }}
              isSubmitting={createUser.isPending || updateUser.isPending}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Usuarios del sistema</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {isLoading ? (
            <p className="text-sm text-zinc-400">Cargando usuarios...</p>
          ) : isError ? (
            <p className="text-sm text-red-200">No fue posible cargar los usuarios.</p>
          ) : data?.length ? (
            <div className="max-w-full overflow-x-auto rounded-md border border-white/10">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-3">Usuario</th>
                    <th className="py-3 pr-3">Rol</th>
                    <th className="py-3 pr-3">Sucursal</th>
                    <th className="py-3 pr-3">Estado</th>
                    <th className="py-3 pr-3">Conexion</th>
                    <th className="py-3 pr-3">App móvil</th>
                    <th className="py-3 pr-3">Creado</th>
                    <th className="py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const sessionSource = getSessionSourceBadge(user);

                    return (
                    <tr key={user.id} className="border-b border-white/6">
                      <td className="py-3 pr-3">
                        <p className="max-w-[220px] truncate font-semibold text-white">
                          {getUserName(user)}
                        </p>
                        <p className="max-w-[220px] truncate text-xs text-zinc-500">
                          {user.email}
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                      </td>
                      <td className="py-3 pr-3 text-zinc-300">
                        {user.sucursalId ? sucursalNameById.get(user.sucursalId) ?? user.branch : user.branch ?? "Todas"}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={user.active && !user.accessRevoked ? "success" : "muted"}>
                          {getUserStatusLabel(user)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex min-w-[150px] items-center gap-2 text-sm">
                          <Circle
                            className={
                              user.isOnline
                                ? "h-3 w-3 fill-cyan-300 text-cyan-300"
                                : "h-3 w-3 fill-zinc-600 text-zinc-600"
                            }
                          />
                          <div className="min-w-0">
                            <p className={user.isOnline ? "font-semibold text-cyan-100" : "text-zinc-400"}>
                              {user.isOnline ? "En linea" : "Desconectado"}
                            </p>
                            <div className="mt-1 flex max-w-[190px] flex-wrap items-center gap-1.5">
                              <Badge variant="outline" className={sessionSource.className}>
                                {sessionSource.label}
                              </Badge>
                              {!user.isOnline && user.lastSeenAt ? (
                                <span className="truncate text-xs text-zinc-500">
                                  {formatDate(user.lastSeenAt)}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        {user.role === "cashier" ? (
                          <Button
                            variant={user.appAccessEnabled ? "outline" : "destructive"}
                            size="sm"
                            disabled={!canManageCashierSettings || updateStatus.isPending}
                            title={
                              canManageCashierSettings
                                ? user.appAccessEnabled
                                  ? "Bloquear acceso a la app móvil"
                                  : "Permitir acceso a la app móvil"
                                : "Los cajeros no pueden modificar este acceso"
                            }
                            onClick={() =>
                              updateStatus.mutate({
                                id: user.id,
                                payload: { appAccessEnabled: !user.appAccessEnabled }
                              })
                            }
                          >
                            {user.appAccessEnabled ? "Permitida" : "Bloqueada"}
                          </Button>
                        ) : (
                          <span className="text-sm text-zinc-500">No aplica</span>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-zinc-400">{formatDate(user.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex min-w-[132px] justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Editar"
                            onClick={() => {
                              setEditingUser(user);
                              setShowForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            title={user.active ? "Desactivar" : "Activar"}
                            onClick={() =>
                              updateStatus.mutate({
                                id: user.id,
                                payload: { active: !user.active }
                              })
                            }
                          >
                            {user.active ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant={user.accessRevoked ? "outline" : "destructive"}
                            size="icon"
                            title={user.accessRevoked ? "Restaurar acceso" : "Cortar acceso"}
                            onClick={() =>
                              updateStatus.mutate({
                                id: user.id,
                                payload: {
                                  accessRevoked: !user.accessRevoked,
                                  active: user.accessRevoked
                                }
                              })
                            }
                          >
                            {user.accessRevoked ? (
                              <Power className="h-4 w-4" />
                            ) : (
                              <ShieldOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length ? null : (
                <p className="px-1 py-5 text-sm text-zinc-400">
                  No hay usuarios que coincidan con la busqueda.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No hay usuarios registrados.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
