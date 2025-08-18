import { useApiBase } from "./api/useApiBase";
import api from "@/lib/axios";
import { handleApiError } from "./api/apiErrorHandler";
import { useState } from "react";
import {
  StockListResponse,
  StockConfigCreate,
  StockConfigUpdate,
} from "@/types/Stock";

// GET /api/stock/?page=&page_size=
export function useStockList(page = 1, page_size = 10) {
  const { data, error, isLoading, mutate } = useApiBase<StockListResponse>(
    `/stock/?list&?page=${page}&page_size=${page_size}`
  );

  return {
    data,
    // IMPORTANT: ler 'stock_configurations'
    items: data?.stock_configurations ?? [],
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
    mutate,
  };
}

export function useStock() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (payload: StockConfigCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/stock/`, payload);
      return res.data;
    } catch (error) {
      const err = handleApiError(error);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (payload: StockConfigUpdate) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.put(`/stock/`, payload);
      return res.data;
    } catch (error) {
      const err = handleApiError(error);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, create, update };
}
