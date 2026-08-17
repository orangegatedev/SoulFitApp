import { GlobalConfigurationView } from "@/components/dashboard/global-configuration-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function GlobalConfigurationPage() {
  return (
    <DashboardShell>
      <GlobalConfigurationView />
    </DashboardShell>
  );
}
