// axiosInstance.ts
import axios from "axios";
import { handleApiError } from "@/hooks/api/apiErrorHandler";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Tratamento de erro 400 (Bad Request)
    if (error.response?.status === 400 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("/accounts/token/refresh/");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao renovar token:", handleApiError(refreshError).message);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Transforma todos os erros em instâncias Error
    return Promise.reject(handleApiError(error));
  }
);

export default axiosInstance;