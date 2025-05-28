import { useState } from "react";

import { useApiBase } from "./api/useApiBase";
import {
  ProductRequest,
  ProductResponse,
  ProductUpdateRequest,
} from "@/types/Product";
import { handleApiError } from "./api/apiErrorHandler";
import api from "@/lib/axios";

// Hook para listar produtos (usando SWR)
// Corrigir a tipagem e acesso aos dados
export function useProductList(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<{
    count: number;
    products: ProductResponse[]; // Alterado de 'results' para 'products'
  }>(`/products/?list&page=${page}&page_size=${page_size}`);

  return {
    data,
    products: data?.products ?? [], // Acessa a propriedade correta
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
    mutate,
  };
}

// Hook para obter produto por ID (usando SWR)
export function useProductById(id: string) {
  const { data, error, isLoading } = useApiBase<{ product: ProductRequest }>(
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

  const update = async (product: ProductUpdateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/products/`, product);
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
