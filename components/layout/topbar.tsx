"use client";

import { LogOut, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import {
  type TopbarSearchScope,
  useTopbarSearchStore
} from "@/stores/topbar-search-store";

const searchConfig: Partial<
  Record<TopbarSearchScope, { placeholder: string; label: string }>
> = {
  users: {
    placeholder: "Buscar usuarios por nombre, email, rol o sucursal",
    label: "Buscar usuarios"
  },
  sucursals: {
    placeholder: "Buscar sucursales por nombre, dirección, teléfono o RUC",
    label: "Buscar sucursales"
  }
};

function getSearchScope(pathname: string): TopbarSearchScope | null {
  if (pathname.startsWith("/users")) return "users";
  if (pathname.startsWith("/sucursales")) return "sucursals";
  return null;
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const searchScope = getSearchScope(pathname);
  const searchQuery = useTopbarSearchStore((state) =>
    searchScope ? state.queries[searchScope] : ""
  );
  const setSearchQuery = useTopbarSearchStore((state) => state.setQuery);
  const activeSearchConfig = searchScope ? searchConfig[searchScope] : null;

  return (
    <header className="sticky top-0 z-30 w-full max-w-full overflow-x-clip border-b border-red-400/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="flex min-h-16 w-full max-w-full min-w-0 items-center gap-2 px-3 py-2 sm:h-16 sm:gap-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {searchScope && activeSearchConfig ? (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              className="w-full min-w-0 pl-9 md:max-w-md"
              value={searchQuery}
              onChange={(event) => setSearchQuery(searchScope, event.target.value)}
              placeholder={activeSearchConfig.placeholder}
              aria-label={activeSearchConfig.label}
            />
          </div>
        ) : null}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">{user?.name ?? "Usuario"}</p>
            <p className="text-xs capitalize text-zinc-400">{user?.role ?? "viewer"}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neon-red via-neon-ember to-neon-cyan text-sm font-black text-white shadow-glow sm:h-10 sm:w-10">
            {(user?.name ?? "SF")
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              await authService.logout().catch(() => undefined);
              logout();
              router.replace("/login");
            }}
            title="Cerrar sesión"
            className="shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
