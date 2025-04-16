import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import type { Product, Products, ProductUpdate } from "@/types/Product";

export function Product() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (product: Product) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/products`, {
        product,
      });
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getById = (id: string) => {
    const { data, error, isLoading } = useApiBase<{ product: Product }>(
      `/products/?id=${id}`
    );
    return {
      product: data?.product ?? null,
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getList = (id: string) => {
    const { data, error, isLoading } = useApiBase<Products>(
      `/products/?id=${id}`
    );
    return {
      products: data?.products ?? [], // garante um array mesmo se der erro
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const update = async (product: ProductUpdate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.patch(`/products`, {
        product,
      });
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(`/products/?id=${id}`, {});
      return response;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, getById, getList, create, update, del };
}
