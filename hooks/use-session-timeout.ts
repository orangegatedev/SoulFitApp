"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sessionTimeoutService } from "@/services/session-timeout.service";
import { useAuthStore } from "@/stores/auth-store";

export function useSessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    return sessionTimeoutService.subscribe(() => {
      logout();
      if (!window.location.pathname.startsWith("/login")) {
        router.replace("/login");
      }
    });
  }, [logout, router]);

  useEffect(() => {
    if (token) sessionTimeoutService.registerNavigation();
  }, [pathname, token]);
}
