"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, ClipboardCheck, Globe2, PackageSearch, Settings2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useAppConfig } from "@/components/layout/app-config-provider";
import { sucursalsService } from "@/services/sucursals.service";
import type { NavItemKey } from "@/types/app-config";

const navItems: Array<{
  key: NavItemKey | "global_configuration";
  href: string;
  label: string;
  icon: typeof BarChart3;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}> = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "ventas_productos", href: "/analytics/productos", label: "Ventas productos", icon: PackageSearch },
  { key: "cierres_caja", href: "/cierres-caja", label: "Cierres de caja", icon: ClipboardCheck },
  { key: "usuarios", href: "/users", label: "Usuarios", icon: Users },
  { key: "sucursales", href: "/sucursales", label: "Sucursales", icon: Building2 },
  { key: "visitas_sitio", href: "/analytics/visitas-web", label: "Visitas del sitio", icon: Globe2, adminOnly: true },
  {
    key: "global_configuration",
    href: "/administracion/configuracion",
    label: "Configuracion global",
    icon: Settings2,
    superAdminOnly: true
  }
];

export function Sidebar({
  open,
  collapsed,
  onClose
}: {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
  const { config } = useAppConfig();
  const { data: branchLogo } = useQuery({
    queryKey: ["sucursals", "logo"],
    queryFn: () => sucursalsService.getLogo()
  });

  useEffect(() => {
    if (!open) return;

    const mobileViewport = window.matchMedia("(max-width: 1023px)");
    const previousOverflow = document.body.style.overflow;

    function syncScrollLock() {
      document.body.style.overflow = mobileViewport.matches ? "hidden" : previousOverflow;
    }

    syncScrollLock();
    mobileViewport.addEventListener("change", syncScrollLock);

    return () => {
      mobileViewport.removeEventListener("change", syncScrollLock);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú lateral"
        className={cn(
          "fixed inset-0 z-[190] cursor-default border-0 bg-black/80 p-0 backdrop-blur-md transition-opacity lg:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />
      <aside
        aria-label="Menú principal"
        className={cn(
          "fixed left-0 top-0 z-[200] flex h-dvh w-[80vw] max-w-xs flex-col overflow-x-hidden overflow-y-auto overscroll-contain border-r border-red-400/10 bg-[#100509]/98 p-4 shadow-[20px_0_50px_rgba(0,0,0,0.55)] transition-[transform,width,padding,opacity,border-color] duration-300 ease-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-40 lg:max-w-none lg:overflow-y-auto lg:shadow-glow",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed
            ? "lg:pointer-events-none lg:w-0 lg:-translate-x-full lg:border-r-0 lg:p-0 lg:opacity-0"
            : "lg:w-72 lg:translate-x-0 lg:opacity-100"
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            {branchLogo ? (
              <img
                src={branchLogo}
                alt="Logo de la sucursal"
                className="h-11 w-11 rounded-lg bg-zinc-950 object-contain p-2 shadow-glow"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-neon-red via-neon-ember to-neon-cyan shadow-glow">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-lg font-black text-white">{config.navTitle}</p>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">
                analytics
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 grid gap-2">
          {navItems.filter((item) => {
            if (item.superAdminOnly) return role === "superadmin";
            if (item.adminOnly && role !== "admin" && role !== "superadmin") return false;
            return config.navVisibility[item.key as NavItemKey] ?? true;
          }).map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold text-zinc-400 transition",
                  active
                    ? "border border-secondary/20 bg-primary/20 text-white shadow-cyanGlow"
                    : "hover:bg-primary/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
