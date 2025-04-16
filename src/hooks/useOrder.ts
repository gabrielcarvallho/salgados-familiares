import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase"; // Ajuste o caminho de importação conforme necessário
import type {
  Order,
  Orders,
  OrderStatus,
  OrderWithAddress,
} from "@/types/Order";
import { PaymentMethods } from "@/types/PaymentMethod";

export function Order() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (order: Order) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/orders/`, {
        order,
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

  const createWithAddress = async (order: OrderWithAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/orders/`, {
        order,
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
    const { data, error, isLoading } = useApiBase<Order>(
      `/costumers/?id=${id}`
    );
    return {
      costumer: data ?? null,
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getList = () => {
    const { data, error, isLoading } = useApiBase<Orders>(`/orders/?list`);
    return {
      orders: data?.orders ?? [], // garante um array mesmo se der erro
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getPaymentMethods = () => {
    const { data, error, isLoading } = useApiBase<PaymentMethods>(
      `/orders/payment-methods/`
    );
    return {
      paymentMethods: data?.paymentMethods ?? [],
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const getOrderStatus = () => {
    const { data, error, isLoading } = useApiBase<OrderStatus>(
      `/orders/payment-methods/`
    );
    return {
      orderStatus: data?.order_status ?? [],
      isLoading,
      isError: error ? String(error) : null,
    };
  };

  const del = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.delete(`/orders/?id=${id}`, {});
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

  return {
    isLoading,
    error,
    getById,
    getList,
    create,
    getOrderStatus,
    del,
    getPaymentMethods,
    createWithAddress,
  };
}
