"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { sessionTimeoutService } from "@/services/session-timeout.service";

function SessionTimeoutController() {
  useSessionTimeout();
  return null;
}

function SessionHeartbeat() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function ping() {
      if (cancelled || document.visibilityState === "hidden") return;
      if (!sessionTimeoutService.isSessionActive()) {
        sessionTimeoutService.checkExpiration();
        return;
      }
      await authService.heartbeat().catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: ["users"] }).catch(() => undefined);
    }

    void ping();
    const intervalId = window.setInterval(() => void ping(), 60_000);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void ping();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient, token]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )
        .catch(() => undefined);

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => undefined);
      }

      return;
    }

    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <QueryClientProvider client={queryClient}>
        <SessionTimeoutController />
        <SessionHeartbeat />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
