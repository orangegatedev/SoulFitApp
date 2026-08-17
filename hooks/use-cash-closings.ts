"use client";

import { useQuery } from "@tanstack/react-query";
import { cashClosingsService } from "@/services/cash-closings.service";
import type { CashClosingListParams } from "@/types/cash-closings";

export function useCashClosingFilterOptions() {
  return useQuery({
    queryKey: ["cash-closings", "filter-options"],
    queryFn: ({ signal }) => cashClosingsService.getFilterOptions(signal)
  });
}

export function useCashClosings(params: CashClosingListParams) {
  return useQuery({
    queryKey: ["cash-closings", "list", params],
    queryFn: ({ signal }) => cashClosingsService.getClosings(params, signal)
  });
}

export function useCashClosingAnalytics(id?: string | null) {
  return useQuery({
    queryKey: ["cash-closings", "analytics", id],
    queryFn: ({ signal }) => cashClosingsService.getAnalytics(id ?? "", signal),
    enabled: Boolean(id)
  });
}

export function useCashClosingDiscountPayments(id?: string | null, enabled = false) {
  return useQuery({
    queryKey: ["cash-closings", "analytics", id, "discount-payments"],
    queryFn: ({ signal }) => cashClosingsService.getDiscountPayments(id ?? "", signal),
    enabled: Boolean(id) && enabled
  });
}
