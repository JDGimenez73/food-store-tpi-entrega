import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../features/auth/api/auth";
import type { UserPublic } from "../features/auth/types";
import { registerSessionCleaner } from "../shared/api/axiosInstance";
import { queryClient } from "../shared/api/queryClient";
interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clear: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await authApi.login(username, password);
        const usuario = await authApi.me();
        queryClient.clear();
        set({ usuario, cargando: false });
      },
      logout: async () => {
        await authApi.logout();
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
      checkSession: async () => {
        try {
          set({ usuario: await authApi.me(), cargando: false });
        } catch {
          queryClient.clear();
          set({ usuario: null, cargando: false });
        }
      },
      clear: () => {
        queryClient.clear();
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "food-store-auth",
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
registerSessionCleaner(() => useAuthStore.getState().clear());
