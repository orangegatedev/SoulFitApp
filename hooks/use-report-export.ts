import { useMutation } from "@tanstack/react-query";
import { generateReportPdf } from "@/lib/pdf";
import { reportsService } from "@/services/reports.service";
import type { DashboardFilters } from "@/types/dashboard";
import type { ReportType } from "@/types/reports";

export function useReportExport() {
  return useMutation({
    mutationFn: ({ type, filters }: { type: ReportType; filters: DashboardFilters }) =>
      reportsService.getReport(type, filters),
    onSuccess: (report) => generateReportPdf(report)
  });
}
