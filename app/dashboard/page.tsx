import { DashboardView } from "@/components/dashboard/dashboard-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardView />
    </DashboardShell>
  );
}
