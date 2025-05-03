import useSWR, { SWRConfiguration } from "swr";
import { useRouter } from "next/navigation";
import { ApiError } from "@/types/ApiBase";
import api from "./api";
import { AxiosError } from "axios";

export function useApiBase<T>(
  endpoint: string | null,
  options: SWRConfiguration<T> = {},
) {
  const router = useRouter();

  const key = endpoint ? endpoint : null;

  const fetcher = async (url: string) => {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const apiError: ApiError = new Error(
        "An error occurred while fetching the data."
      );
      apiError.info = axiosError.response?.data;
      apiError.status = axiosError.response?.status;
      throw apiError;
    }
  };

  const { data, error, mutate, isValidating } = useSWR<T>(
    key,
    key ? fetcher : null,
    {
      ...options,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      dedupingInterval: 60000,
      refreshInterval: 0,

      onErrorRetry: async (err, key, config, revalidate, { retryCount }) => {
        const apiError = err as ApiError;

        // Verifica erros de autorização (401 ou 400)
        if (apiError.status === 401 || apiError.status === 400) {
          // Limita para uma única tentativa
          if (retryCount < 1) {
            try {
              console.log("Revalidating after token refresh");
              await revalidate();
            } catch (retryError) {
              console.log(retryCount);
              console.log("Token refresh failed:", retryError);
              router.push("/login");
            }
          } else {
            console.log("Max retry count reached, redirecting to login");
            router.push("/login");
          }
          return;
        }
      },
    },
  );

  return {
    data,
    error,
    mutate,
    isLoading: !error && !data,
    isValidating,
  };
}