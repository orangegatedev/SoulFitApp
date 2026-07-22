import { api, useMocks } from "@/lib/api";
import { filterOptions } from "@/services/mock-data";
import type { Membership, MembershipApiResponse } from "@/types/memberships";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

type PaginatedResponse<T> = {
  current_page?: number;
  data: T[];
  total?: number;
};

type MembershipsResponse =
  | MembershipApiResponse[]
  | ApiEnvelope<MembershipApiResponse[] | PaginatedResponse<MembershipApiResponse>>
  | PaginatedResponse<MembershipApiResponse>;

function unwrapList(response: MembershipsResponse) {
  if (Array.isArray(response)) return response;

  const data = response.data;

  if (Array.isArray(data)) return data;

  return data.data;
}

function normalizeMembership(item: MembershipApiResponse): Membership {
  return {
    id: String(item.id ?? item.Id ?? ""),
    name: item.name ?? item.Name ?? item.nombre ?? item.Nombre ?? item.titulo ?? item.Titulo ?? ""
  };
}

export const membershipsService = {
  async searchMemberships(query = ""): Promise<Membership[]> {
    if (!useMocks) {
      const search = query.trim();
      const { data } = await api.get<MembershipsResponse>("/membresias/buscar", {
        params: {
          search,
          q: search,
          nombre: search
        }
      });

      const memberships = unwrapList(data).map(normalizeMembership).filter((item) => item.id && item.name);

      if (!search) return memberships;

      return memberships.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    }

    const search = query.trim().toLowerCase();
    return filterOptions.memberships
      .map((item) => ({ id: item.value, name: item.label }))
      .filter((item) => !search || item.name.toLowerCase().includes(search));
  }
};
