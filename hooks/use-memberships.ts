import { useQuery } from "@tanstack/react-query";
import { membershipsService } from "@/services/memberships.service";

export function useMembershipSearch(query: string) {
  return useQuery({
    queryKey: ["memberships", "search", query],
    queryFn: () => membershipsService.searchMemberships(query)
  });
}
