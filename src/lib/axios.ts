import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetcher = axios.create({
  baseURL: API_URL!,
  withCredentials: true,
});

const requestStats = [400, 401];

fetcher.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthCall = originalRequest.url?.includes('/accounts/token');

    if (
      requestStats.includes(status) &&
      !originalRequest._retry &&
      !isAuthCall
    ) {
      originalRequest._retry = true;
      try {
        await fetcher.post('/accounts/token/refresh/');
        return fetcher(originalRequest);
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw refreshError;
      }
    }

    return Promise.reject(error);
  },
);

export default fetcher;
