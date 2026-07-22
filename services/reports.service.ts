import { api, useMocks } from "@/lib/api";
import { buildReport } from "@/services/mock-data";
import type { DashboardFilters } from "@/types/dashboard";
import type { ReportResponse, ReportType } from "@/types/reports";

export const reportsService = {
  async getReport(type: ReportType, filters: DashboardFilters): Promise<ReportResponse> {
    if (!useMocks) {
      const { data } = await api.get<ReportResponse>(`/reports/${type}`, {
        params: filters
      });
      return data;
    }

    return {
      ...buildReport(type),
      filters
    };
  }
};
