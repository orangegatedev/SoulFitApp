"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen overflow-x-clip bg-fitness-radial">
        <div className="flex min-h-screen w-full max-w-full overflow-x-clip">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="min-w-0 flex-1 overflow-x-clip">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-5 sm:px-6 lg:py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
