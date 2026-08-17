import { CashClosingsView } from "@/components/cash-closings/cash-closings-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CashClosingsPage() {
  return (
    <DashboardShell>
      <CashClosingsView />
    </DashboardShell>
  );
}
