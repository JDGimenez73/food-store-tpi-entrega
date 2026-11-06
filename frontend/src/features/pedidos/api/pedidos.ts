import { api } from "../../../shared/api/axiosInstance";
import type { Paginado } from "../../productos/types";
import type {
  Pedido,
  PedidoCreate,
  EstadoPedido,
  ResumenPedidos,
} from "../types";
export const pedidosApi = {
  list: async (skip = 0, limit = 20, estado?: EstadoPedido) =>
    (
      await api.get<Paginado<Pedido>>("/pedidos", {
        params: { skip, limit, estado },
      })
    ).data,
  detail: async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  create: async (input: PedidoCreate) =>
    (await api.post<Pedido>("/pedidos", input)).data,
  cancelar: async (id: number) =>
    (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
  estado: async (id: number, estado: EstadoPedido) =>
    (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  resumen: async () => (await api.get<ResumenPedidos>("/pedidos/resumen")).data,
};
