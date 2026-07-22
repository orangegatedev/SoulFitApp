import { api, useMocks } from "@/lib/api";
import {
  filterOptions,
  mockAbsentClients,
  mockAttendance,
  mockCashiers,
  mockMemberships,
  mockPeakHours,
  mockSummary,
  mockTopClients
} from "@/services/mock-data";
import { sucursalsService } from "@/services/sucursals.service";
import type {
  AbsentClientsByMembership,
  AbsentClientsMetrics,
  AbsentClientsResponse,
  CashierMetric,
  DashboardFilterOptions,
  DashboardFilters,
  DashboardSummary,
  RankingPoint,
  TimeSeriesPoint
} from "@/types/dashboard";

type AbsentClientsMetricsApi = {
  sin_asistencia?: number | string | null;
  un_mes?: number | string | null;
  dos_meses?: number | string | null;
  tres_meses?: number | string | null;
  seis_meses?: number | string | null;
  nueve_meses?: number | string | null;
};

type AbsentClientsByMembershipApi = AbsentClientsMetricsApi & {
  membresia?: string | null;
};

type AbsentClientsApiResponse = {
  clientes_ausentes?: AbsentClientsMetricsApi;
  clientes_ausentes_por_membresia?: AbsentClientsByMembershipApi[];
};

function toNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeAbsentMetrics(metrics?: AbsentClientsMetricsApi): AbsentClientsMetrics {
  return {
    sinAsistencia: toNumber(metrics?.sin_asistencia),
    unMes: toNumber(metrics?.un_mes),
    dosMeses: toNumber(metrics?.dos_meses),
    tresMeses: toNumber(metrics?.tres_meses),
    seisMeses: toNumber(metrics?.seis_meses),
    nueveMeses: toNumber(metrics?.nueve_meses)
  };
}

function normalizeAbsentMembership(
  item: AbsentClientsByMembershipApi
): AbsentClientsByMembership {
  return {
    membership: item.membresia ?? "Sin membresia registrada",
    ...normalizeAbsentMetrics(item)
  };
}

function normalizeAbsentClients(data: AbsentClientsApiResponse): AbsentClientsResponse {
  return {
    clientesAusentes: normalizeAbsentMetrics(data.clientes_ausentes),
    clientesAusentesPorMembresia:
      data.clientes_ausentes_por_membresia?.map(normalizeAbsentMembership) ?? []
  };
}

export const dashboardService = {
  async getFilterOptions(): Promise<DashboardFilterOptions> {
    if (!useMocks) {
      const sucursals = await sucursalsService.getSucursals();

      return {
        cashiers: [],
        memberships: [],
        branches: sucursals.map((sucursal) => ({
          value: sucursal.id,
          label: sucursal.nombre
        }))
      };
    }

    return filterOptions;
  },

  async getSummary(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<DashboardSummary> {
    if (!useMocks) {
      const { data } = await api.get<DashboardSummary>("/dashboard/summary", {
        params: filters,
        signal
      });
      return data;
    }
    return mockSummary;
  },

  async getAttendance(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<TimeSeriesPoint[]> {
    if (!useMocks) {
      const { data } = await api.get<TimeSeriesPoint[]>("/dashboard/attendance", {
        params: filters,
        signal
      });
      return data;
    }
    return mockAttendance;
  },

  async getTopClients(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<RankingPoint[]> {
    if (!useMocks) {
      const { data } = await api.get<RankingPoint[]>("/dashboard/top-clients", {
        params: filters,
        signal
      });
      return data;
    }
    return mockTopClients;
  },

  async getPeakHours(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<TimeSeriesPoint[]> {
    if (!useMocks) {
      const { data } = await api.get<TimeSeriesPoint[]>("/dashboard/peak-hours", {
        params: filters,
        signal
      });
      return data;
    }
    return mockPeakHours;
  },

  async getMemberships(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<RankingPoint[]> {
    if (!useMocks) {
      const { data } = await api.get<RankingPoint[]>("/dashboard/memberships", {
        params: filters,
        signal
      });
      return data;
    }
    return mockMemberships;
  },

  async getCashierSales(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<CashierMetric[]> {
    if (!useMocks) {
      const { data } = await api.get<CashierMetric[]>("/dashboard/cashiers-sales", {
        params: filters,
        signal
      });
      return data;
    }
    return mockCashiers;
  },

  async getCashierRevenue(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<CashierMetric[]> {
    if (!useMocks) {
      const { data } = await api.get<CashierMetric[]>("/dashboard/cashiers-revenue", {
        params: filters,
        signal
      });
      return data;
    }
    return mockCashiers;
  },

  async getAbsentClients(
    filters: DashboardFilters,
    signal?: AbortSignal
  ): Promise<AbsentClientsResponse> {
    if (!useMocks) {
      const { data } = await api.get<AbsentClientsApiResponse>("/dashboard/absent-clients", {
        params: filters,
        signal
      });
      return normalizeAbsentClients(data);
    }

    return mockAbsentClients;
  }
};
