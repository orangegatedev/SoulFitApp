"use client";

import { create } from "zustand";
import type { DashboardFilters } from "@/types/dashboard";

interface FilterState {
  filters: DashboardFilters;
  setFilter: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => void;
  setFilters: (filters: DashboardFilters) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value || undefined
      }
    })),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} })
}));
