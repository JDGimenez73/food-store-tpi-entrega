import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productosApi } from "../api/productos";
import type { ProductosFiltros } from "../types";
export const useProductos = (filtros: ProductosFiltros) =>
  useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => productosApi.list(filtros),
    placeholderData: keepPreviousData,
  });
