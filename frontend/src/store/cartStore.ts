import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Producto } from "../features/productos/types";
export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}
interface CartState {
  items: CartItem[];
  agregar: (producto: Producto) => void;
  quitar: (id: number) => void;
  cambiarCantidad: (id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (producto) =>
        set((state) => {
          const previous = state.items.find(
            (item) => item.producto_id === producto.id,
          );
          if (
            !producto.disponible ||
            producto.stock < 1 ||
            (previous && previous.cantidad >= producto.stock)
          )
            return state;
          return {
            items: previous
              ? state.items.map((item) =>
                  item.producto_id === producto.id
                    ? {
                        ...item,
                        cantidad: item.cantidad + 1,
                        precio_unitario: producto.precio_base,
                      }
                    : item,
                )
              : [
                  ...state.items,
                  {
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    precio_unitario: producto.precio_base,
                    cantidad: 1,
                  },
                ],
          };
        }),
      quitar: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.producto_id !== id),
        })),
      cambiarCantidad: (id, cantidad) => {
        if (!Number.isInteger(cantidad) || cantidad < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.producto_id === id ? { ...item, cantidad } : item,
          ),
        }));
      },
      vaciar: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    { name: "food-store-cart" },
  ),
);
