import type { DashboardFilters } from "@/types/dashboard";

export type ReportType =
  | "attendance"
  | "top-clients"
  | "peak-hours"
  | "memberships"
  | "cashiers-sales"
  | "cashiers-revenue";

export interface ReportRow {
  [key: string]: string | number;
}

export interface ReportResponse {
  type: ReportType;
  title: string;
  generatedAt: string;
  filters: DashboardFilters;
  columns: string[];
  rows: ReportRow[];
  summary: {
    label: string;
    value: string | number;
  }[];
}
