"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, hasHydrated, logout } = useAuthStore();
  const isLogin = pathname.startsWith("/login");
  const isSuperAdminRoute = pathname.startsWith("/administracion/configuracion");

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener("soulfit:unauthorized", onUnauthorized);
    return () => window.removeEventListener("soulfit:unauthorized", onUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!token && !isLogin) {
      router.replace("/login");
      return;
    }

    if (token && user && !user.active) {
      logout();
      router.replace("/login");
      return;
    }

    if (token && isLogin) {
      router.replace("/dashboard");
      return;
    }

    if (token && user && isSuperAdminRoute && user.role !== "superadmin") {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isLogin, isSuperAdminRoute, logout, router, token, user]);

  if (!hasHydrated && !isLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fitness-radial">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
