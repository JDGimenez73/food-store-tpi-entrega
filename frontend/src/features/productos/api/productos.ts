import { api } from "../../../shared/api/axiosInstance";
import type {
  Producto,
  ProductoInput,
  ProductosFiltros,
  Paginado,
} from "../types";
export const productosApi = {
  list: async (params: ProductosFiltros) =>
    (await api.get<Paginado<Producto>>("/productos", { params })).data,
  create: async (input: ProductoInput) =>
    (await api.post<Producto>("/productos", input)).data,
  update: async (id: number, input: ProductoInput) =>
    (await api.put<Producto>(`/productos/${id}`, input)).data,
  stock: async (id: number, stock: number, disponible: boolean) =>
    (await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible }))
      .data,
  remove: async (id: number) => {
    await api.delete(`/productos/${id}`);
  },
};
