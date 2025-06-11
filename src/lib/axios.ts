// api.ts
import axios from "axios";
import { handleApiError } from "@/hooks/api/apiErrorHandler";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // ✅ Verificação mais robusta das URLs de autenticação
    const isAuthCall =
      originalRequest.url?.includes("/accounts/token/") ||
      originalRequest.url?.includes("/accounts/login/") ||
      originalRequest.url?.includes("/accounts/register/");

    // ✅ Condições corrigidas para evitar loop infinito
    if (
      (status === 401 || status === 400) && // Verifica ambos os status
      !originalRequest._retry && // Não foi tentado antes
      !isAuthCall // Não é uma chamada de autenticação
    ) {
      originalRequest._retry = true;

      try {
        // ✅ Tentativa de refresh token
        await api.post("/accounts/token/refresh/");
        // ✅ Reexecuta a requisição original com novo token
        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Erro ao renovar token:",
          handleApiError(refreshError).message
        );

        // ✅ Remove tokens locais se existirem
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Redireciona para login
          window.location.href = "/login";
        }

        // ✅ Rejeita a promise para não continuar processamento
        return Promise.reject(refreshError);
      }
    }

    // ✅ Para requisições de autenticação que falharam, redireciona direto
    if (isAuthCall && (status === 401 || status === 400)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(handleApiError(error));
  }
);

export default api;
