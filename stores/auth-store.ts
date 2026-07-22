"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: "soulfit-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: (state) => (_persistedState, error) => {
        if (error && typeof window !== "undefined") {
          window.localStorage.removeItem("soulfit-auth");
        }

        state.setHasHydrated(true);
      }
    }
  )
);
