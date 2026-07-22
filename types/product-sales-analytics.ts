export interface ProductSalesFilters {
  from?: string;
  to?: string;
  cashierId?: string;
  categoryId?: string;
  productId?: string;
  branchId?: string;
}

export interface ProductSalesDetailsParams {
  page: number;
  perPage: number;
}

export interface ProductSalesFilterOption {
  value: string;
  label: string;
  categoryId?: string;
}

export interface ProductSalesFilterOptions {
  cashiers: ProductSalesFilterOption[];
  categories: ProductSalesFilterOption[];
  products: ProductSalesFilterOption[];
  branches: ProductSalesFilterOption[];
}

export interface ProductRankingPoint {
  id: string;
  name: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  value?: number;
  meta?: string;
}

export interface ProductSalesSummary {
  totalRevenue: number;
  totalQuantity: number;
  salesCount: number;
  averageTicket: number;
  topProductByQuantity: ProductRankingPoint | null;
  topProductByRevenue: ProductRankingPoint | null;
  totalDiscount: number;
}

export interface ProductSalesDatePoint {
  label: string;
  revenue: number;
  quantity: number;
}

export interface ProductSalesCategoryPoint {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
}

export interface ProductSalesTopProducts {
  byQuantity: ProductRankingPoint[];
  byRevenue: ProductRankingPoint[];
}

export interface ProductSalesCashierPoint {
  id: string;
  name: string;
  salesCount: number;
  quantity: number;
  revenue: number;
}

export interface ProductSalesHourPoint {
  label: string;
  salesCount: number;
  quantity: number;
  revenue: number;
}

export interface ProductSalesDiscountPoint {
  id: string;
  productName: string;
  categoryName: string;
  discount: number;
  revenue: number;
  discountRate: number;
}

export interface ProductSalesDetailRow {
  id: string;
  date: string | null;
  cashierName: string;
  branchName: string;
  categoryName: string;
  productName: string;
  unitName: string;
  quantity: number;
  priceBeforeDiscount: number;
  finalUnitPrice: number;
  discount: number;
  subtotal: number;
  paymentMethod: string;
}

export interface ProductSalesPaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface ProductSalesDetailsResponse {
  data: ProductSalesDetailRow[];
  meta: ProductSalesPaginationMeta;
}
