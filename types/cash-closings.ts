export interface CashClosingFilters {
  userId?: string;
  month?: string;
  year?: string;
}

export interface CashClosingListParams extends CashClosingFilters {
  page: number;
  perPage: number;
}

export interface CashClosingRow {
  id: string;
  fechaCierre: string | null;
  fechaApertura: string | null;
  userId: string | null;
  userName: string;
  authorizedById: string | null;
  authorizedByName: string | null;
  branchId: string | null;
  branchName: string;
  exchangeRateId: string | null;
  exchangeRate: number;
  totalDolar: number;
  totalCordoba: number;
  totalRecaudado: number;
  openingId: string | null;
  openingCordoba: number;
  openingDollar: number;
  openingStatus: string;
  pcName: string;
  ipAddress: string;
}

export interface CashClosingPaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface CashClosingListResponse {
  data: CashClosingRow[];
  meta: CashClosingPaginationMeta;
}

export interface CashClosingFilterOptions {
  years: number[];
}

export interface CashClosingRelation {
  source: string;
  from: string | null;
  to: string | null;
  isReliable: boolean;
  note: string;
}

export interface CashClosingPaymentMethodPoint {
  name: string;
  currency?: string;
  paymentsCount?: number;
  salesCount?: number;
  revenue: number;
}

export interface CashClosingGeneral {
  openingCordoba: number;
  openingDollar: number;
  closedCordoba: number;
  closedDollar: number;
  closedTotal: number;
  exchangeRate: number;
  membershipRevenueCordoba: number;
  membershipRevenueDollar: number;
  productRevenueCordoba: number;
  membershipPayments: number;
  productSales: number;
  totalOperations: number;
  totalDiscount: number;
  paymentMethods: {
    memberships: CashClosingPaymentMethodPoint[];
    products: CashClosingPaymentMethodPoint[];
  };
}

export interface CashClosingMembershipSummary {
  paymentsCount: number;
  grossRevenue: number;
  netRevenue: number;
  discount: number;
  mora: number;
  netCordoba: number;
  netDollar: number;
}

export interface CashClosingMembershipCategory {
  name: string;
  paymentsCount: number;
  grossRevenue: number;
  discount: number;
  netRevenue: number;
}

export interface CashClosingMembershipPoint extends CashClosingMembershipCategory {
  id: string;
  period: string;
  category: string;
}

export interface CashClosingProductSummary {
  salesCount: number;
  quantity: number;
  revenue: number;
  averageTicket: number;
}

export interface CashClosingProductCategory {
  name: string;
  salesCount: number;
  quantity: number;
  revenue: number;
}

export interface CashClosingProductPoint {
  id: string;
  name: string;
  categoryName: string;
  quantity: number;
  revenue: number;
}

export interface CashClosingDiscountSummary {
  totalDiscount: number;
  paymentsWithDiscount: number;
  grossRevenue: number;
  discountRate: number;
}

export interface CashClosingDiscountCategory {
  name: string;
  paymentsCount: number;
  discount: number;
  grossRevenue: number;
}

export interface CashClosingDiscountMembership extends CashClosingDiscountCategory {
  id: string;
  category: string;
}

export interface CashClosingDiscountPayment {
  id: string;
  clientName: string;
  cashierName: string;
  membershipId: string | null;
  membershipName: string;
  membershipPeriod: string;
  membershipCategory: string;
  paidAt: string | null;
  branchName: string;
  currency: string;
  referenceNumber: string | null;
  originalAmount: number;
  discount: number;
  paidAmount: number;
  mora: number;
}

export interface CashClosingDiscountPaymentsSummary {
  count: number;
  totalDiscount: number;
  analyticsPaymentsWithDiscount: number;
  analyticsTotalDiscount: number;
  grossRevenue: number;
  netRevenue: number;
  matchesAnalytics: boolean;
}

export interface CashClosingDiscountPaymentsResponse {
  closing: CashClosingRow;
  relation: CashClosingRelation;
  summary: CashClosingDiscountPaymentsSummary;
  payments: CashClosingDiscountPayment[];
}

export interface CashClosingAnalytics {
  closing: CashClosingRow;
  relation: CashClosingRelation;
  general: CashClosingGeneral;
  memberships: {
    summary: CashClosingMembershipSummary;
    byCategory: CashClosingMembershipCategory[];
    byMembership: CashClosingMembershipPoint[];
    byPaymentMethod: CashClosingPaymentMethodPoint[];
  };
  products: {
    summary: CashClosingProductSummary;
    byCategory: CashClosingProductCategory[];
    topProducts: CashClosingProductPoint[];
    byPaymentMethod: CashClosingPaymentMethodPoint[];
  };
  discounts: {
    summary: CashClosingDiscountSummary;
    byCategory: CashClosingDiscountCategory[];
    byMembership: CashClosingDiscountMembership[];
  };
}
