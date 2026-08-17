import { api } from "@/lib/api";
import type {
  CashClosingAnalytics,
  CashClosingDiscountPaymentsResponse,
  CashClosingFilterOptions,
  CashClosingListParams,
  CashClosingListResponse
} from "@/types/cash-closings";

function toParams(params: CashClosingListParams) {
  return {
    user_id: params.userId,
    month: params.month,
    year: params.year,
    page: params.page,
    per_page: params.perPage
  };
}

export const cashClosingsService = {
  async getFilterOptions(signal?: AbortSignal): Promise<CashClosingFilterOptions> {
    const { data } = await api.get<CashClosingFilterOptions>(
      "/cash-closings/filter-options",
      { signal }
    );
    return data;
  },

  async getClosings(
    params: CashClosingListParams,
    signal?: AbortSignal
  ): Promise<CashClosingListResponse> {
    const { data } = await api.get<{
      data: CashClosingListResponse["data"];
      meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
      };
    }>("/cash-closings", {
      params: toParams(params),
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
  },

  async getAnalytics(id: string, signal?: AbortSignal): Promise<CashClosingAnalytics> {
    const { data } = await api.get<CashClosingAnalytics>(
      `/cash-closings/${id}/analytics`,
      { signal }
    );
    return data;
  },

  async getDiscountPayments(
    id: string,
    signal?: AbortSignal
  ): Promise<CashClosingDiscountPaymentsResponse> {
    const { data } = await api.get<CashClosingDiscountPaymentsResponse>(
      `/cash-closings/${id}/analytics/discount-payments`,
      { signal }
    );
    return data;
  }
};
