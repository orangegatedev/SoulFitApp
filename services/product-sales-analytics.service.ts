import { api } from "@/lib/api";
import type {
  ProductSalesCashierPoint,
  ProductSalesCategoryPoint,
  ProductSalesDatePoint,
  ProductSalesDetailsParams,
  ProductSalesDetailsResponse,
  ProductSalesDiscountPoint,
  ProductSalesFilterOptions,
  ProductSalesFilters,
  ProductSalesHourPoint,
  ProductSalesSummary,
  ProductSalesTopProducts
} from "@/types/product-sales-analytics";

function toParams(filters: ProductSalesFilters, details?: Partial<ProductSalesDetailsParams>) {
  return {
    from: filters.from,
    to: filters.to,
    cashier_id: filters.cashierId,
    category_id: filters.categoryId,
    product_id: filters.productId,
    sucursal_id: filters.branchId,
    page: details?.page,
    per_page: details?.perPage
  };
}

export const productSalesAnalyticsService = {
  async getFilterOptions(signal?: AbortSignal): Promise<ProductSalesFilterOptions> {
    const { data } = await api.get<ProductSalesFilterOptions>(
      "/analytics/product-sales/filter-options",
      { signal }
    );
    return data;
  },

  async getSummary(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesSummary> {
    const { data } = await api.get<ProductSalesSummary>("/analytics/product-sales/summary", {
      params: toParams(filters),
      signal
    });
    return data;
  },

  async getByDate(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesDatePoint[]> {
    const { data } = await api.get<ProductSalesDatePoint[]>("/analytics/product-sales/by-date", {
      params: toParams(filters),
      signal
    });
    return data;
  },

  async getByCategory(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesCategoryPoint[]> {
    const { data } = await api.get<ProductSalesCategoryPoint[]>(
      "/analytics/product-sales/by-category",
      {
        params: toParams(filters),
        signal
      }
    );
    return data;
  },

  async getTopProducts(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesTopProducts> {
    const { data } = await api.get<ProductSalesTopProducts>(
      "/analytics/product-sales/top-products",
      {
        params: toParams(filters),
        signal
      }
    );
    return data;
  },

  async getByCashier(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesCashierPoint[]> {
    const { data } = await api.get<ProductSalesCashierPoint[]>(
      "/analytics/product-sales/by-cashier",
      {
        params: toParams(filters),
        signal
      }
    );
    return data;
  },

  async getByHour(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesHourPoint[]> {
    const { data } = await api.get<ProductSalesHourPoint[]>("/analytics/product-sales/by-hour", {
      params: toParams(filters),
      signal
    });
    return data;
  },

  async getDiscounts(
    filters: ProductSalesFilters,
    signal?: AbortSignal
  ): Promise<ProductSalesDiscountPoint[]> {
    const { data } = await api.get<ProductSalesDiscountPoint[]>(
      "/analytics/product-sales/discounts",
      {
        params: toParams(filters),
        signal
      }
    );
    return data;
  },

  async getDetails(
    filters: ProductSalesFilters,
    pagination: ProductSalesDetailsParams,
    signal?: AbortSignal
  ): Promise<ProductSalesDetailsResponse> {
    const { data } = await api.get<{
      data: ProductSalesDetailsResponse["data"];
      meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    }>("/analytics/product-sales/details", {
      params: toParams(filters, pagination),
      signal
    });

    return {
      data: data.data,
      meta: {
        currentPage: data.meta.current_page,
        perPage: data.meta.per_page,
        total: data.meta.total,
        lastPage: data.meta.last_page
      }
    };
  }
};
