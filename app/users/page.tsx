import { UsersManagement } from "@/components/dashboard/users-management";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function UsersPage() {
  return (
    <DashboardShell>
      <UsersManagement />
    </DashboardShell>
  );
}
