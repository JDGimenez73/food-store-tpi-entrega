import { api } from "../../../shared/api/axiosInstance";
import type { UserPublic } from "../../auth/types";
export const usuariosApi = {
  list: async () => (await api.get<UserPublic[]>("/admin/usuarios")).data,
  estado: async (id: number, disabled: boolean) =>
    (
      await api.post<UserPublic>(
        `/admin/usuarios/${id}/${disabled ? "desactivar" : "activar"}`,
      )
    ).data,
};
