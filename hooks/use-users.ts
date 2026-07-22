import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload
} from "@/types/users";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersService.getUsers
  });
}

export function useCashiers() {
  return useQuery({
    queryKey: ["users", "cashiers"],
    queryFn: () => usersService.searchCashiers()
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateUserStatusPayload;
    }) => usersService.updateStatus(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });
}
