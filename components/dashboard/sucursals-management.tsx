"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SucursalForm } from "@/components/forms/sucursal-form";
import {
  useCreateSucursal,
  useDeleteSucursal,
  useSucursals,
  useUpdateSucursal,
  useUpdateSucursalStatus
} from "@/hooks/use-sucursals";
import { useTopbarSearchStore } from "@/stores/topbar-search-store";
import type { Sucursal, SucursalPayload } from "@/types/sucursals";

function isActive(estado?: string) {
  return (estado ?? "").toLowerCase() === "activa" || (estado ?? "").toLowerCase() === "activo";
}

function normalizeSearchText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return null;

  const response = "response" in error ? error.response : undefined;

  if (response && typeof response === "object" && "data" in response) {
    const data = response.data;

    if (typeof data === "string") {
      return data;
    }

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

  return error instanceof Error ? error.message : "No fue posible completar la operacion.";
}

export function SucursalsManagement() {
  const { data, isLoading, isError } = useSucursals();
  const createSucursal = useCreateSucursal();
  const updateSucursal = useUpdateSucursal();
  const updateStatus = useUpdateSucursalStatus();
  const deleteSucursal = useDeleteSucursal();
  const [editingSucursal, setEditingSucursal] = useState<Sucursal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const searchQuery = useTopbarSearchStore((state) => state.queries.sucursals);
  const filteredSucursals = useMemo(() => {
    const search = normalizeSearchText(searchQuery.trim());
    const sucursals = data ?? [];

    if (!search) return sucursals;

    return sucursals.filter((sucursal) => {
      const searchableText = [
        sucursal.nombre,
        sucursal.direccion,
        sucursal.telefono,
        sucursal.ruc
      ]
        .map(normalizeSearchText)
        .join(" ");

      return searchableText.includes(search);
    });
  }, [data, searchQuery]);
  const formError = getErrorMessage(editingSucursal ? updateSucursal.error : createSucursal.error);
  const actionError = getErrorMessage(updateStatus.error ?? deleteSucursal.error);

  function handleSubmit(payload: SucursalPayload) {
    createSucursal.reset();
    updateSucursal.reset();

    if (editingSucursal) {
      updateSucursal.mutate(
        { id: editingSucursal.id, payload },
        {
          onSuccess: () => {
            setEditingSucursal(null);
            setShowForm(false);
          }
        }
      );
      return;
    }

    createSucursal.mutate(payload, {
      onSuccess: () => setShowForm(false)
    });
  }

  function handleDelete(sucursal: Sucursal) {
    const confirmed = window.confirm(`Eliminar la sucursal "${sucursal.nombre}"?`);
    if (confirmed) {
      deleteSucursal.reset();
      deleteSucursal.mutate(sucursal.id);
    }
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
            Operacion
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Gestion de sucursales
          </h1>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            createSucursal.reset();
            updateSucursal.reset();
            setEditingSucursal(null);
            setShowForm((value) => !value);
          }}
        >
          <Plus className="h-4 w-4" />
          Nueva sucursal
        </Button>
      </div>

      {showForm ? (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>
              {editingSucursal ? "Editar sucursal" : "Crear sucursal"}
            </CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {formError ? (
              <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {formError}
              </p>
            ) : null}
            <SucursalForm
              sucursal={editingSucursal}
              onSubmit={handleSubmit}
              onCancel={() => {
                createSucursal.reset();
                updateSucursal.reset();
                setShowForm(false);
                setEditingSucursal(null);
              }}
              isSubmitting={createSucursal.isPending || updateSucursal.isPending}
            />
          </CardContent>
        </Card>
      ) : null}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Sucursales</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {actionError ? (
            <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {actionError}
            </p>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-zinc-400">Cargando sucursales...</p>
          ) : isError ? (
            <p className="text-sm text-red-200">No fue posible cargar las sucursales.</p>
          ) : data?.length ? (
            <div className="max-w-full overflow-x-auto rounded-md border border-white/10">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-3">Sucursal</th>
                    <th className="py-3 pr-3">Direccion</th>
                    <th className="py-3 pr-3">Teléfono</th>
                    <th className="py-3 pr-3">RUC</th>
                    <th className="py-3 pr-3">Estado</th>
                    <th className="py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSucursals.map((sucursal) => {
                    const active = isActive(sucursal.estado);
                    return (
                      <tr key={sucursal.id} className="border-b border-white/6">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/10">
                              {sucursal.logo ? (
                                <img
                                  src={sucursal.logo}
                                  alt={`Logo de ${sucursal.nombre}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-black text-red-100">
                                  {sucursal.nombre.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{sucursal.nombre}</p>
                              <p className="text-xs text-zinc-500">ID {sucursal.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] truncate py-3 pr-3 text-zinc-300">
                          {sucursal.direccion ?? "Sin dirección"}
                        </td>
                        <td className="py-3 pr-3 text-zinc-300">
                          {sucursal.telefono ?? "Sin teléfono"}
                        </td>
                        <td className="py-3 pr-3 text-zinc-300">{sucursal.ruc ?? "Sin RUC"}</td>
                        <td className="py-3 pr-3">
                          <Badge variant={active ? "success" : "muted"}>{sucursal.estado}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex min-w-[132px] justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              title="Editar"
                              onClick={() => {
                                createSucursal.reset();
                                updateSucursal.reset();
                                setEditingSucursal(sucursal);
                                setShowForm(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              title={active ? "Desactivar" : "Activar"}
                              onClick={() => {
                                updateStatus.reset();
                                updateStatus.mutate({
                                  id: sucursal.id,
                                  estado: active ? "Inactiva" : "Activa"
                                });
                              }}
                            >
                              {active ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="Eliminar"
                              onClick={() => handleDelete(sucursal)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredSucursals.length ? null : (
                <p className="px-1 py-5 text-sm text-zinc-400">
                  No hay sucursales que coincidan con la busqueda.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No hay sucursales registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
