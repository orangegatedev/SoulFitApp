import { api, useMocks } from "@/lib/api";
import { mockAuthUser, mockUsers } from "@/services/mock-data";
import type { LoginPayload, LoginResponse } from "@/types/auth";

function getUserName(user: { name?: string; nombres?: string; apellidos?: string }) {
  return user.name ?? [user.nombres, user.apellidos].filter(Boolean).join(" ");
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    if (!useMocks) {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      return data;
    }

    const matchingUser = mockUsers.find(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase()
    );

    if (matchingUser && (!matchingUser.active || matchingUser.accessRevoked)) {
      throw new Error("El usuario esta desactivado o tiene el acceso cortado.");
    }

    return {
      token: "mock.jwt.token.soulfit",
      user: matchingUser
        ? {
            id: matchingUser.id,
            name: getUserName(matchingUser),
            email: matchingUser.email,
            role: matchingUser.role,
            active: matchingUser.active,
            branch: matchingUser.branch
          }
        : mockAuthUser
    };
  },

  async heartbeat(): Promise<void> {
    if (!useMocks) {
      await api.post("/auth/heartbeat");
    }
  },

  async logout(): Promise<void> {
    if (!useMocks) {
      await api.post("/auth/logout");
    }
  }
};
