import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidos";
import type { EstadoPedido } from "../types";
export const usePedidos = (skip: number, estado?: EstadoPedido) =>
  useQuery({
    queryKey: ["pedidos", skip, estado],
    queryFn: () => pedidosApi.list(skip, 20, estado),
  });
export const useResumenPedidos = () =>
  useQuery({ queryKey: ["resumen"], queryFn: pedidosApi.resumen });
export function usePedidoMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado?: EstadoPedido }) =>
      estado ? pedidosApi.estado(id, estado) : pedidosApi.cancelar(id),
    onSuccess: async () => {
      await Promise.all(
        ["pedidos", "resumen", "productos"].map((key) =>
          client.invalidateQueries({ queryKey: [key] }),
        ),
      );
    },
  });
}
