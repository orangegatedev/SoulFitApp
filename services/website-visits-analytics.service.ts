import { api } from "@/lib/api";
import type { PaginatedVisits, VisitFilters, WebsiteVisitOverview } from "@/types/website-visits-analytics";
const params = (filters: VisitFilters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
export const websiteVisitsAnalyticsService = {
  async overview(filters: VisitFilters) { return (await api.get<WebsiteVisitOverview>("/analytics/website-visits/overview", { params: params(filters) })).data; },
  async recent(filters: VisitFilters, page: number) { return (await api.get<PaginatedVisits>("/analytics/website-visits/recent", { params: { ...params(filters), page, per_page: 20 } })).data; }
};