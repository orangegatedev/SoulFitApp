import { SucursalsManagement } from "@/components/dashboard/sucursals-management";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function SucursalesPage() {
  return (
    <DashboardShell>
      <SucursalsManagement />
    </DashboardShell>
  );
}
