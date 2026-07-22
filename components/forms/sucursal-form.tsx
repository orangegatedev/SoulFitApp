"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Sucursal, SucursalPayload } from "@/types/sucursals";

export function SucursalForm({
  sucursal,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  sucursal?: Sucursal | null;
  onSubmit: (payload: SucursalPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}) {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ruc, setRuc] = useState("");
  const [estado, setEstado] = useState("Activa");
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    setNombre(sucursal?.nombre ?? "");
    setDireccion(sucursal?.direccion ?? "");
    setTelefono(sucursal?.telefono ?? "");
    setRuc(sucursal?.ruc ?? "");
    setEstado(sucursal?.estado ?? "Activa");
    setLogo(null);
  }, [sucursal]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      nombre,
      direccion: direccion || undefined,
      telefono: telefono || undefined,
      ruc: ruc || undefined,
      estado,
      logo
    });
  }

  return (
    <form className="grid min-w-0 gap-4" onSubmit={handleSubmit}>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          maxLength={60}
          required
        />
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={direccion}
          onChange={(event) => setDireccion(event.target.value)}
        />
      </div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-3">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
            maxLength={25}
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="ruc">RUC</Label>
          <Input id="ruc" value={ruc} onChange={(event) => setRuc(event.target.value)} />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="estado">Estado</Label>
          <Select id="estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
          </Select>
        </div>
      </div>
      <div className="grid min-w-0 gap-2">
        <Label htmlFor="logo">Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-zinc-500">
          {logo
            ? logo.name
            : sucursal?.logo
              ? "Logo actual cargado. Selecciona otro archivo para reemplazarlo."
              : "Selecciona una imagen para la sucursal."}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Guardando..." : sucursal ? "Actualizar sucursal" : "Crear sucursal"}
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
