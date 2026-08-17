"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, ImageIcon, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appConfigService } from "@/services/app-config.service";
import { useAppConfig } from "@/components/layout/app-config-provider";
import { resolveAssetUrl } from "@/lib/asset-url";
import type { AppConfig, NavItemKey, NavVisibility } from "@/types/app-config";

const navVisibilityItems: Array<{ key: NavItemKey; label: string }> = [
  { key: "dashboard", label: "Dashboard" },
  { key: "ventas_productos", label: "Ventas productos" },
  { key: "cierres_caja", label: "Cierres de caja" },
  { key: "usuarios", label: "Usuarios" },
  { key: "sucursales", label: "Sucursales" },
  { key: "visitas_sitio", label: "Visitas del sitio" }
];

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") return "No fue posible guardar la configuracion.";

  const response = "response" in error ? error.response : undefined;
  if (response && typeof response === "object" && "data" in response) {
    const data = response.data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
  }

  return error instanceof Error ? error.message : "No fue posible guardar la configuracion.";
}

function snapshot(config: AppConfig) {
  return JSON.stringify({
    siteName: config.siteName,
    browserTitle: config.browserTitle,
    loginTitle: config.loginTitle,
    navTitle: config.navTitle,
    navVisibility: config.navVisibility
  });
}

export function GlobalConfigurationView() {
  const { config, setConfig } = useAppConfig();
  const [siteName, setSiteName] = useState(config.siteName);
  const [browserTitle, setBrowserTitle] = useState(config.browserTitle);
  const [loginTitle, setLoginTitle] = useState(config.loginTitle);
  const [navTitle, setNavTitle] = useState(config.navTitle);
  const [navVisibility, setNavVisibility] = useState<NavVisibility>(config.navVisibility);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(config.faviconUrl);
  const [faviconPreviewFailed, setFaviconPreviewFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAdminConfig() {
      setIsLoading(true);
      setError(null);

      try {
        const adminConfig = await appConfigService.getAdmin();
        if (!active) return;
        setConfig(adminConfig);
      } catch (exception) {
        if (!active) return;
        setError(getErrorMessage(exception));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadAdminConfig();

    return () => {
      active = false;
    };
  }, [setConfig]);

  useEffect(() => {
    setSiteName(config.siteName);
    setBrowserTitle(config.browserTitle);
    setLoginTitle(config.loginTitle);
    setNavTitle(config.navTitle);
    setNavVisibility(config.navVisibility);
    setFaviconPreview(config.faviconUrl);
    setFaviconPreviewFailed(false);
    setFavicon(null);
  }, [config]);

  useEffect(() => {
    if (!favicon) return;

    const url = URL.createObjectURL(favicon);
    setFaviconPreview(url);
    setFaviconPreviewFailed(false);

    return () => URL.revokeObjectURL(url);
  }, [favicon]);

  const resolvedFaviconPreview = resolveAssetUrl(faviconPreview);

  const hasChanges = useMemo(() => {
    const nextSnapshot = snapshot({
      ...config,
      siteName,
      browserTitle,
      loginTitle,
      navTitle,
      navVisibility
    });

    return snapshot(config) !== nextSnapshot || Boolean(favicon);
  }, [browserTitle, config, favicon, loginTitle, navTitle, navVisibility, siteName]);

  function onFaviconChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);

    if (file && !file.name.toLowerCase().endsWith(".ico")) {
      event.target.value = "";
      setFavicon(null);
      setFaviconPreview(config.faviconUrl);
      setFaviconPreviewFailed(false);
      setError("El favicon debe ser un archivo .ico.");
      return;
    }

    setFavicon(file);
    setFaviconPreviewFailed(false);
  }

  function toggleNavVisibility(key: NavItemKey) {
    setNavVisibility((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await appConfigService.update({
        siteName,
        browserTitle,
        loginTitle,
        navTitle,
        navVisibility,
        favicon
      });

      setConfig(updated);
      setSuccess("Configuracion global actualizada correctamente.");
    } catch (exception) {
      setError(getErrorMessage(exception));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="grid min-w-0 max-w-full gap-6 overflow-x-hidden" onSubmit={onSubmit}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100/70">
            Administracion
          </p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Configuracion global
          </h1>
        </div>
        <Button type="submit" disabled={isSaving || isLoading || !hasChanges} className="w-full sm:w-auto">
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          {success}
        </p>
      ) : null}

      <section className="grid min-w-0 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-cyan-200" />
              Identidad del sitio
            </CardTitle>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-4">
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="siteName">Nombre del sitio</Label>
              <Input id="siteName" value={siteName} onChange={(event) => setSiteName(event.target.value)} required />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="browserTitle">Titulo del navegador</Label>
              <Input id="browserTitle" value={browserTitle} onChange={(event) => setBrowserTitle(event.target.value)} required />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="loginTitle">Titulo del Login</Label>
              <Input id="loginTitle" value={loginTitle} onChange={(event) => setLoginTitle(event.target.value)} required />
            </div>
            <div className="grid min-w-0 gap-2">
              <Label htmlFor="navTitle">Titulo del Nav</Label>
              <Input id="navTitle" value={navTitle} onChange={(event) => setNavTitle(event.target.value)} required />
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-200" />
              Archivos visuales
            </CardTitle>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-5">
            <div className="grid min-w-0 gap-3">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-white/10 bg-zinc-950">
                  {resolvedFaviconPreview && !faviconPreviewFailed ? (
                    <img
                      src={resolvedFaviconPreview}
                      alt="Preview favicon"
                      className="max-h-10 max-w-10 object-contain"
                      onError={() => setFaviconPreviewFailed(true)}
                      onLoad={() => setFaviconPreviewFailed(false)}
                    />
                  ) : (
                    <div className="grid place-items-center gap-1 text-center">
                      <ImageIcon className="h-5 w-5 text-zinc-600" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                        Sin favicon
                      </span>
                    </div>
                  )}
                </div>
                <Input
                  id="favicon"
                  type="file"
                  accept=".ico,image/x-icon,image/vnd.microsoft.icon"
                  onChange={onFaviconChange}
                />
              </div>
              <p className="text-xs text-zinc-500">
                Formato permitido: .ico. Se recomienda incluir tamanos 16x16, 32x32 y 48x48.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Visibilidad del menu</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3">
          {navVisibilityItems.map((item) => {
            const visible = navVisibility[item.key];
            return (
              <div
                key={item.key}
                className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.key}</p>
                </div>
                <Button
                  type="button"
                  variant={visible ? "default" : "outline"}
                  className="min-w-28"
                  onClick={() => toggleNavVisibility(item.key)}
                >
                  {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {visible ? "Visible" : "Oculto"}
                </Button>
              </div>
            );
          })}
          <p className="text-sm text-zinc-500">
            Configuracion global permanece siempre visible para SuperAdmin y no se puede ocultar desde esta lista.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
