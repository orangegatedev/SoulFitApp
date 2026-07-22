"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Globe2, PackageSearch, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sucursalsService } from "@/services/sucursals.service";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/analytics/productos", label: "Ventas productos", icon: PackageSearch },
  { href: "/users", label: "Usuarios", icon: Users },
  { href: "/sucursales", label: "Sucursales", icon: Building2 },
  { href: "/analytics/visitas-web", label: "Visitas del sitio", icon: Globe2, adminOnly: true }
];

export function Sidebar({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.user?.role);
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
          "fixed left-0 top-0 z-[200] flex h-dvh w-[80vw] max-w-xs flex-col overflow-y-auto overscroll-contain border-r border-red-400/10 bg-[#100509]/98 p-4 shadow-[20px_0_50px_rgba(0,0,0,0.55)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-40 lg:w-72 lg:max-w-none lg:translate-x-0 lg:overflow-y-auto lg:shadow-glow",
          open ? "translate-x-0" : "-translate-x-full"
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
              <p className="text-lg font-black text-white">SoulFit</p>
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
          {navItems.filter((item) => !item.adminOnly || role === "admin").map((item) => {
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
