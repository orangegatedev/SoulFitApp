"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const SIDEBAR_COLLAPSED_KEY = "soulfit-sidebar-collapsed";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    setSidebarCollapsed(storedValue === "true");
  }, []);

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextValue));
      return nextValue;
    });
  }

  return (
    <AuthGuard>
      <div className="h-dvh overflow-hidden bg-fitness-radial">
        <div className="flex h-full w-full max-w-full overflow-hidden">
          <Sidebar
            open={sidebarOpen}
            collapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-[padding,width] duration-300 ease-out motion-reduce:transition-none">
            <Topbar
              sidebarCollapsed={sidebarCollapsed}
              onMenuClick={() => setSidebarOpen(true)}
              onSidebarToggle={toggleSidebarCollapsed}
            />
            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-3 py-5 sm:px-6 lg:py-8">
              <div className="mx-auto w-full max-w-7xl min-w-0">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
