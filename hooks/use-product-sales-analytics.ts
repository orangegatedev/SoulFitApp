"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productSalesAnalyticsService } from "@/services/product-sales-analytics.service";
import type { ProductSalesDetailsParams, ProductSalesFilters } from "@/types/product-sales-analytics";

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

export function useProductSalesAnalytics(
  filters: ProductSalesFilters,
  detailsParams: ProductSalesDetailsParams
) {
  const queryClient = useQueryClient();
  const rawFilterKey = JSON.stringify(filters);
  const debouncedFilters = useDebouncedValue(filters);
  const debouncedFilterKey = JSON.stringify(debouncedFilters);
  const isDebouncing = rawFilterKey !== debouncedFilterKey;
  const previousRawFilterKey = useRef(rawFilterKey);

  useEffect(() => {
    if (previousRawFilterKey.current === rawFilterKey) return;

    previousRawFilterKey.current = rawFilterKey;
    void queryClient.cancelQueries({ queryKey: ["product-sales-analytics"] });
  }, [queryClient, rawFilterKey]);

  const filterOptions = useQuery({
    queryKey: ["product-sales-analytics", "filter-options"],
    queryFn: ({ signal }) => productSalesAnalyticsService.getFilterOptions(signal)
  });

  const summary = useQuery({
    queryKey: ["product-sales-analytics", "summary", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getSummary(debouncedFilters, signal),
    enabled: !isDebouncing
  });

  const canLoadPrimaryCharts = !isDebouncing && isQuerySettled(summary);

  const byDate = useQuery({
    queryKey: ["product-sales-analytics", "by-date", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getByDate(debouncedFilters, signal),
    enabled: canLoadPrimaryCharts
  });

  const byHour = useQuery({
    queryKey: ["product-sales-analytics", "by-hour", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getByHour(debouncedFilters, signal),
    enabled: canLoadPrimaryCharts
  });

  const canLoadSecondary = canLoadPrimaryCharts && isQuerySettled(byDate) && isQuerySettled(byHour);

  const byCategory = useQuery({
    queryKey: ["product-sales-analytics", "by-category", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getByCategory(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const topProducts = useQuery({
    queryKey: ["product-sales-analytics", "top-products", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getTopProducts(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const byCashier = useQuery({
    queryKey: ["product-sales-analytics", "by-cashier", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getByCashier(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const discounts = useQuery({
    queryKey: ["product-sales-analytics", "discounts", debouncedFilters],
    queryFn: ({ signal }) => productSalesAnalyticsService.getDiscounts(debouncedFilters, signal),
    enabled: canLoadSecondary
  });

  const details = useQuery({
    queryKey: ["product-sales-analytics", "details", debouncedFilters, detailsParams],
    queryFn: ({ signal }) =>
      productSalesAnalyticsService.getDetails(debouncedFilters, detailsParams, signal),
    enabled: canLoadSecondary
  });

  return {
    filters: debouncedFilters,
    isDebouncing,
    canLoadPrimaryCharts,
    canLoadSecondary,
    filterOptions,
    summary,
    byDate,
    byHour,
    byCategory,
    topProducts,
    byCashier,
    discounts,
    details
  };
}
