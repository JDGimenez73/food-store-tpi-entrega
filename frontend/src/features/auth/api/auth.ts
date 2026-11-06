import { api } from "../../../shared/api/axiosInstance";
import type { UserCreate, UserPublic } from "../types";
export const authApi = {
  register: async (input: UserCreate) =>
    (await api.post<UserPublic>("/auth/register", input)).data,
  login: async (username: string, password: string) => {
    await api.post("/auth/token", new URLSearchParams({ username, password }));
  },
  me: async () => (await api.get<UserPublic>("/auth/me")).data,
  logout: async () => {
    await api.post("/auth/logout");
  },
};
