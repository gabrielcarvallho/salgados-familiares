"use client";
import { useState } from "react";
import { useApiBase } from "./api/useApiBase";
import api from "@/lib/axios";
import { handleApiError } from "./api/apiErrorHandler";
import {
  ProductionCreate,
  ProductionUpdate,
  ProductionListResponse,
} from "@/types/Production";

// GET /api/production/?list&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&page=&page_size=
export function useProductionList(
  start_date?: string,
  end_date?: string,
  page = 1,
  page_size = 10
) {
  const params = new URLSearchParams();
  params.set("list", "");
  if (start_date) params.set("start_date", start_date);
  if (end_date) params.set("end_date", end_date);
  params.set("page", String(page));
  params.set("page_size", String(page_size));

  const key = `/production/?${params.toString()}`;
  const { data, error, isLoading, mutate } = useApiBase<ProductionListResponse>(key);

  return {
    data,
    records: data?.production_records ?? [],
    totalItems: data?.count ?? 0,
    isLoading,
    isError: error ? String(error) : null,
    mutate,
  };
}

export function useProduction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // POST /api/production/
  const create = async (payload: ProductionCreate) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post(`/production/`, payload);
      return res.data;
    } catch (error) {
      const err = handleApiError(error);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // PUT /api/production/
  const update = async (payload: ProductionUpdate) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.put(`/production/`, payload);
      return res.data;
    } catch (error) {
      const err = handleApiError(error);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  
  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.delete(`/production/?id=${id}`);
      return res.data;
    } catch (error) {
      const err = handleApiError(error);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  return { isLoading, error, create, update, del };
}
