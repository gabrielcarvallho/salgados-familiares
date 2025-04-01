import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Criação de uma instância do Axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Cookies são enviados automaticamente
});

// Interceptador para lidar com respostas
axiosInstance.interceptors.response.use(
  (response) => response, // Se a resposta for bem-sucedida, retorna normalmente
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 400 && !originalRequest._retry) {
      originalRequest._retry = true; // Evita loops infinitos

      try {
        // Tenta renovar o token
        await axiosInstance.post("/accounts/token/refresh/");

        // Refaz a requisição original
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Erro ao renovar o token:", refreshError);

        // Opcional: Redireciona para login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Se não for um erro de autorização, rejeita a promessa normalmente
    return Promise.reject(error);
  },
);

export default axiosInstance;
