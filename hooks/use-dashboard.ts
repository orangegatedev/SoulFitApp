import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardFilters } from "@/types/dashboard";

function useDebouncedValue<T>(value: T, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

function isQuerySettled(query: { isSuccess: boolean; isError: boolean }) {
  return query.isSuccess || query.isError;
}

export function useDashboard(filters: DashboardFilters) {
  const queryClient = useQueryClient();
  const rawFilterKey = JSON.stringify(filters);
  const debouncedFilters = useDebouncedValue(filters);
  const debouncedFilterKey = JSON.stringify(debouncedFilters);
  const isDebouncing = rawFilterKey !== debouncedFilterKey;
  const previousRawFilterKey = useRef(rawFilterKey);

  useEffect(() => {
    if (previousRawFilterKey.current === rawFilterKey) return;

    previousRawFilterKey.current = rawFilterKey;
    void queryClient.cancelQueries({ queryKey: ["dashboard"] });
  }, [queryClient, rawFilterKey]);

  const summary = useQuery({
    queryKey: ["dashboard", "summary", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getSummary(debouncedFilters, signal),
    enabled: !isDebouncing
  });

  const canLoadCharts = !isDebouncing && isQuerySettled(summary);

  const attendance = useQuery({
    queryKey: ["dashboard", "attendance", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getAttendance(debouncedFilters, signal),
    enabled: canLoadCharts
  });

  const peakHours = useQuery({
    queryKey: ["dashboard", "peak-hours", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getPeakHours(debouncedFilters, signal),
    enabled: canLoadCharts
  });

  const canLoadSecondary =
    canLoadCharts && isQuerySettled(attendance) && isQuerySettled(peakHours);

  const topClients = useQuery({
    queryKey: ["dashboard", "top-clients", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getTopClients(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const memberships = useQuery({
    queryKey: ["dashboard", "memberships", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getMemberships(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const cashierSales = useQuery({
    queryKey: ["dashboard", "cashiers", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getCashierSales(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const cashierRevenue = useMemo(
    () => ({
      ...cashierSales,
      data: cashierSales.data
        ? [...cashierSales.data].sort((left, right) => right.revenue - left.revenue)
        : undefined
    }),
    [cashierSales]
  );

  const absentClients = useQuery({
    queryKey: ["dashboard", "absent-clients", debouncedFilters],
    queryFn: ({ signal }) => dashboardService.getAbsentClients(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const queries = [
    summary,
    attendance,
    peakHours,
    topClients,
    memberships,
    cashierSales,
    absentClients
  ];

  return {
    filters: debouncedFilters,
    isDebouncing,
    canLoadCharts,
    canLoadSecondary,
    summary,
    attendance,
    topClients,
    peakHours,
    memberships,
    cashierSales,
    cashierRevenue,
    absentClients,
    isLoading: queries.some((query) => query.isLoading),
    isError: queries.some((query) => query.isError)
  };
}

export function useDashboardFilterOptions() {
  return useQuery({
    queryKey: ["dashboard", "filter-options"],
    queryFn: dashboardService.getFilterOptions
  });
}
