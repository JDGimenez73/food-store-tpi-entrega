import axios from "axios";
let clearSession = () => {};
export function registerSessionCleaner(cleaner: () => void) {
  clearSession = cleaner;
}
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const path = error.config?.url || "";
      if (
        (error.response?.status === 401 &&
          !["/auth/token", "/auth/me"].includes(path)) ||
        (error.response?.status === 400 &&
          error.response.data.detail === "Cuenta de usuario desactivada")
      )
        clearSession();
    }
    return Promise.reject(error);
  },
);
