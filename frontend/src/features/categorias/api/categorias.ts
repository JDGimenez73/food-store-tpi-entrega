import { api } from "../../../shared/api/axiosInstance";
import type { Categoria, CategoriaInput } from "../types";
export const categoriasApi = {
  list: async () => (await api.get<Categoria[]>("/categorias")).data,
  create: async (input: CategoriaInput) =>
    (await api.post<Categoria>("/categorias", input)).data,
  update: async (id: number, input: CategoriaInput) =>
    (await api.put<Categoria>(`/categorias/${id}`, input)).data,
  remove: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  },
};
