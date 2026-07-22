"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportExport } from "@/hooks/use-report-export";
import { useFilterStore } from "@/stores/filter-store";
import type { ReportType } from "@/types/reports";

export function ChartCard({
  title,
  reportType,
  children
}: {
  title: string;
  reportType: ReportType;
  children: React.ReactNode;
}) {
  const filters = useFilterStore((state) => state.filters);
  const exportReport = useReportExport();

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="min-w-0">{title}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportReport.mutate({ type: reportType, filters })}
          disabled={exportReport.isPending}
          className="w-full sm:w-auto"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}
