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
    const isLoginCall = originalRequest.url?.endsWith("/accounts/token/")  // ajuste conforme seu path
      || originalRequest.url?.endsWith("/accounts/token/refresh/");

    if (error.response?.status === 400 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/accounts/token/refresh/");
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao renovar token:", handleApiError(refreshError).message);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(handleApiError(error));
  }
);

export default api;
