import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sucursalsService } from "@/services/sucursals.service";
import type { SucursalPayload } from "@/types/sucursals";

export function useSucursals() {
  return useQuery({
    queryKey: ["sucursals"],
    queryFn: sucursalsService.getSucursals
  });
}

export function useCreateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SucursalPayload) => sucursalsService.createSucursal(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sucursals"] })
  });
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SucursalPayload }) =>
      sucursalsService.updateSucursal(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sucursals"] })
  });
}

export function useUpdateSucursalStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      sucursalsService.updateSucursalStatus(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sucursals"] })
  });
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sucursalsService.deleteSucursal(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sucursals"] })
  });
}
