import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 400) &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/accounts/token/refresh/") // Evita loop infinito
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const retry = await api.post("/accounts/token/refresh/");

        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error("Erro ao renovar o token:", refreshError);
        processQueue(refreshError);
        isRefreshing = false;

        // Redireciona para login quando o refresh token falha
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
