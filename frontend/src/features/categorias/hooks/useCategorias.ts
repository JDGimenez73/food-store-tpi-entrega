import { useQuery } from "@tanstack/react-query";
import { categoriasApi } from "../api/categorias";
export const useCategorias = () =>
  useQuery({ queryKey: ["categorias"], queryFn: categoriasApi.list });
