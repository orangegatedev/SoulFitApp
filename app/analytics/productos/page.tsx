import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ProductSalesAnalyticsView } from "@/components/product-sales-analytics/product-sales-analytics-view";

export default function ProductSalesAnalyticsPage() {
  return (
    <DashboardShell>
      <ProductSalesAnalyticsView />
    </DashboardShell>
  );
}
