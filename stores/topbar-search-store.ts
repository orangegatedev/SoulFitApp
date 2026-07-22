"use client";

import { create } from "zustand";

export type TopbarSearchScope = "users" | "sucursals";

interface TopbarSearchState {
  queries: Record<TopbarSearchScope, string>;
  setQuery: (scope: TopbarSearchScope, query: string) => void;
  clearQuery: (scope: TopbarSearchScope) => void;
}

export const useTopbarSearchStore = create<TopbarSearchState>((set) => ({
  queries: {
    users: "",
    sucursals: ""
  },
  setQuery: (scope, query) =>
    set((state) => ({
      queries: {
        ...state.queries,
        [scope]: query
      }
    })),
  clearQuery: (scope) =>
    set((state) => ({
      queries: {
        ...state.queries,
        [scope]: ""
      }
    }))
}));
