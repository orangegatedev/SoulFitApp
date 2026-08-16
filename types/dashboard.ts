export interface DashboardFilters {
  from?: string;
  to?: string;
  cashierId?: string;
  membershipType?: string;
  branchId?: string;
}

export interface DashboardSummary {
  totalAttendance: number;
  activeClients: number;
  membershipsSold: number;
  productSales: number;
  membershipSales: number;
  totalSales: number;
  membershipRevenue: number;
  productRevenue: number;
  totalRevenue: number;
  membershipDiscountsCount: number;
  membershipDiscountsRate: number;
  membershipDiscountAmount: number;
  membershipDiscountCordoba: number;
  membershipDiscountDollar: number;
  attendanceTrend: number;
  clientsTrend: number;
  membershipsTrend: number;
  revenueTrend: number;
  discountsTrend: number;
  discountAmountTrend: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface RankingPoint {
  id: string;
  name: string;
  value: number;
  meta?: string;
}

export interface CashierMetric {
  cashierId: string;
  cashierName: string;
  productSales: number;
  membershipSales: number;
  sales: number;
  productRevenue: number;
  membershipRevenue: number;
  revenue: number;
}

export interface AbsentClientsMetrics {
  sinAsistencia: number;
  unMes: number;
  dosMeses: number;
  tresMeses: number;
  seisMeses: number;
  nueveMeses: number;
}

export interface AbsentClientsByMembership extends AbsentClientsMetrics {
  membership: string;
}

export interface AbsentClientsResponse {
  clientesAusentes: AbsentClientsMetrics;
  clientesAusentesPorMembresia: AbsentClientsByMembership[];
}

export interface DashboardData {
  summary: DashboardSummary;
  attendance: TimeSeriesPoint[];
  topClients: RankingPoint[];
  peakHours: TimeSeriesPoint[];
  memberships: RankingPoint[];
  cashierSales: CashierMetric[];
  cashierRevenue: CashierMetric[];
  absentClients: AbsentClientsResponse;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface DashboardFilterOptions {
  cashiers: FilterOption[];
  memberships: FilterOption[];
  branches: FilterOption[];
}
