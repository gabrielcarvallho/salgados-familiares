import { useState } from "react";
import { useApiBase } from "./api/useApiBase";
import {
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
} from "@/types/Product";
import { handleApiError } from "./api/apiErrorHandler";
import api from "@/lib/axios";

// Lista de produtos com status novo
// status: "active" | "inactive" | "all" (ajuste conforme backend)
// page: 1-based
export function useProductList(
  status: string,
  page = 1,
  page_size = 10
) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    products: ProductResponse[];
  }>(
    `/products/?list&status=${status}&page=${page}&page_size=${page_size}`
  );

  return {
    data,
    products: data?.products ?? [],
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
    mutate,
  };
}

// Produto por ID
export function useProductById(id: string) {
  const { data, error, isLoading } = useApiBase<{ product: ProductResponse }>(
    `/products/?id=${id}`
  );
  return {
    product: data?.product ?? null,
    isLoading,
    isError: error ? String(error) : null,
  };
}

export function useProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (product: ProductRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/products/`, product);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  // Update agora é PUT com payload completo
  const update = async (product: ProductUpdateRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.put(`/products/`, product);
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/products/?id=${id}`, {});
      return response;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, create, update, del };
}
