"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useDashboardFilterOptions } from "@/hooks/use-dashboard";
import { useMembershipSearch } from "@/hooks/use-memberships";
import { useUserOptions } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/stores/filter-store";
import type { Membership } from "@/types/memberships";
import type { UserFilterOption } from "@/types/users";

function getUserName(user: UserFilterOption) {
  return user.label;
}

const dropdownClassName =
  "absolute z-[100] mt-2 w-full overflow-hidden rounded-md border border-secondary/20 bg-zinc-950 p-2 shadow-cyanGlow";
const optionListClassName = "mt-2 grid max-h-32 gap-1 overflow-y-auto overflow-x-hidden pr-1";
const optionButtonClassName =
  "flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm text-zinc-200 hover:bg-secondary/10 hover:text-white";
const resetOptionButtonClassName =
  "flex h-10 min-w-0 w-full items-center rounded-md px-3 text-left text-sm font-semibold text-white hover:bg-secondary/10";

export function FiltersBar() {
  const { filters, setFilter, clearFilters } = useFilterStore();
  const { data } = useDashboardFilterOptions();
  const { data: users = [], isLoading: isLoadingUsers, isError: isUsersError } =
    useUserOptions();
  const [cashierOpen, setCashierOpen] = useState(false);
  const [cashierSearch, setCashierSearch] = useState("");
  const [debouncedCashierSearch, setDebouncedCashierSearch] = useState("");
  const [selectedCashier, setSelectedCashier] = useState<UserFilterOption | null>(null);
  const [membershipOpen, setMembershipOpen] = useState(false);
  const [membershipSearch, setMembershipSearch] = useState("");
  const [debouncedMembershipSearch, setDebouncedMembershipSearch] = useState("");
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const cashierRef = useRef<HTMLDivElement>(null);
  const membershipRef = useRef<HTMLDivElement>(null);
  const {
    data: memberships = [],
    isLoading: isLoadingMemberships,
    isError: isMembershipsError,
    refetch: refetchMemberships
  } = useMembershipSearch(debouncedMembershipSearch);
  const visibleCashiers = useMemo(() => {
    const search = debouncedCashierSearch.trim().toLowerCase();

    return users.filter((user) => {
        const cashierName = getUserName(user).toLowerCase();
        const cashierEmail = user.email.toLowerCase();

        return !search || cashierName.includes(search) || cashierEmail.includes(search);
      });
  }, [users, debouncedCashierSearch]);
  const matchingCashier = useMemo(
    () => users.find((user) => user.value === filters.cashierId),
    [users, filters.cashierId]
  );
  const visibleMemberships = useMemo(() => memberships, [memberships]);
  const selectedCashierLabel =
    selectedCashier ? getUserName(selectedCashier) : matchingCashier
      ? getUserName(matchingCashier)
      : "Todos";
  const selectedMembershipLabel =
    selectedMembership?.name ??
    memberships.find((membership) => membership.id === filters.membershipType)?.name ??
    "Todas";

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedCashierSearch(cashierSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [cashierSearch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedMembershipSearch(membershipSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [membershipSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!cashierRef.current?.contains(event.target as Node)) {
        setCashierOpen(false);
      }

      if (!membershipRef.current?.contains(event.target as Node)) {
        setMembershipOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!filters.cashierId) {
      setSelectedCashier(null);
      return;
    }

    const matchingCashier = users.find((user) => user.value === filters.cashierId);
    if (matchingCashier) {
      setSelectedCashier(matchingCashier);
    }
  }, [filters.cashierId, users]);

  useEffect(() => {
    if (!filters.membershipType) {
      setSelectedMembership(null);
      return;
    }

    const matchingMembership = memberships.find(
      (membership) => membership.id === filters.membershipType
    );
    if (matchingMembership) {
      setSelectedMembership(matchingMembership);
    }
  }, [filters.membershipType, memberships]);

  function selectCashier(cashier: UserFilterOption | null) {
    setSelectedCashier(cashier);
    setFilter("cashierId", cashier?.value ?? "");
    setCashierOpen(false);
    setCashierSearch("");
  }

  function selectMembership(membership: Membership | null) {
    setSelectedMembership(membership);
    setFilter("membershipType", membership?.id ?? "");
    setMembershipOpen(false);
    setMembershipSearch("");
  }

  function toggleCashierDropdown() {
    setCashierOpen((value) => !value);
  }

  function toggleMembershipDropdown() {
    const shouldOpen = !membershipOpen;
    setMembershipOpen(shouldOpen);

    if (shouldOpen) {
      void refetchMemberships();
    }
  }

  return (
    <section className="relative z-40 min-w-0 rounded-lg border border-red-400/10 bg-zinc-950/70 p-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <SlidersHorizontal className="h-4 w-4 text-neon-cyan" />
        Filtros
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            value={filters.from ?? ""}
            onChange={(event) => setFilter("from", event.target.value)}
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="to">Hasta</Label>
          <Input
            id="to"
            type="date"
            value={filters.to ?? ""}
            onChange={(event) => setFilter("to", event.target.value)}
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="cashier">Usuario</Label>
          <div ref={cashierRef} className="relative min-w-0">
            <button
              id="cashier"
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 text-left text-sm text-white focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                cashierOpen ? "border-secondary/60 ring-2 ring-ring" : ""
              )}
              onClick={toggleCashierDropdown}
            >
              <span className="min-w-0 flex-1 truncate">{selectedCashierLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>

            {cashierOpen ? (
              <div className={dropdownClassName}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={cashierSearch}
                    onChange={(event) => setCashierSearch(event.target.value)}
                    placeholder="Buscar usuario"
                    className="pl-9"
                    autoFocus
                  />
                </div>

                <div className={optionListClassName}>
                  <button
                    type="button"
                    className={resetOptionButtonClassName}
                    onClick={() => selectCashier(null)}
                  >
                    <span className="min-w-0 flex-1 truncate">Todos</span>
                  </button>

                  {isLoadingUsers ? (
                    <p className="px-3 py-2 text-sm text-zinc-400">Cargando usuarios...</p>
                  ) : isUsersError ? (
                    <p className="px-3 py-2 text-sm text-red-200">
                      No fue posible cargar usuarios.
                    </p>
                  ) : visibleCashiers.length ? (
                    visibleCashiers.map((cashier) => (
                      <button
                        key={cashier.value}
                        type="button"
                        className={cn(
                          optionButtonClassName,
                          filters.cashierId === cashier.value ? "bg-primary/15 text-red-100" : ""
                        )}
                        onClick={() => selectCashier(cashier)}
                      >
                        <span className="min-w-0 flex-1 truncate">{getUserName(cashier)}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-zinc-400">Sin resultados.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="membership">Membresia</Label>
          <div ref={membershipRef} className="relative min-w-0">
            <button
              id="membership"
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 text-left text-sm text-white focus-visible:border-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                membershipOpen ? "border-secondary/60 ring-2 ring-ring" : ""
              )}
              onClick={toggleMembershipDropdown}
            >
              <span className="min-w-0 flex-1 truncate">{selectedMembershipLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>

            {membershipOpen ? (
              <div className={dropdownClassName}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={membershipSearch}
                    onChange={(event) => setMembershipSearch(event.target.value)}
                    placeholder="Buscar membresia"
                    className="pl-9"
                    autoFocus
                  />
                </div>

                <div className={optionListClassName}>
                  <button
                    type="button"
                    className={resetOptionButtonClassName}
                    onClick={() => selectMembership(null)}
                  >
                    <span className="min-w-0 flex-1 truncate">Todas</span>
                  </button>

                  {isLoadingMemberships ? (
                    <p className="px-3 py-2 text-sm text-zinc-400">Cargando membresias...</p>
                  ) : isMembershipsError ? (
                    <p className="px-3 py-2 text-sm text-red-200">
                      No fue posible cargar membresias.
                    </p>
                  ) : visibleMemberships.length ? (
                    visibleMemberships.map((membership) => (
                      <button
                        key={membership.id}
                        type="button"
                        className={cn(
                          optionButtonClassName,
                          filters.membershipType === membership.id ? "bg-primary/15 text-red-100" : ""
                        )}
                        onClick={() => selectMembership(membership)}
                      >
                        <span className="min-w-0 flex-1 truncate">{membership.name}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-zinc-400">Sin resultados.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="branch">Sucursal</Label>
          <Select
            id="branch"
            value={filters.branchId ?? ""}
            onChange={(event) => setFilter("branchId", event.target.value)}
          >
            <option value="">Todas</option>
            {data?.branches.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex min-w-0 items-end">
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <RotateCcw className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
    </section>
  );
}
