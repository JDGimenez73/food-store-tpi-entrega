import type { Categoria } from "../../categorias/types";
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  categoria_id: number;
  categoria: Categoria;
  stock: number;
  disponible: boolean;
  activo: boolean;
}
export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  categoria_id: number;
  stock: number;
  disponible: boolean;
}
export interface ProductosFiltros {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
export interface Paginado<T> {
  total: number;
  items: T[];
}
