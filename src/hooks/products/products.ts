import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "../useApiBase"; // Ajuste o caminho de importação conforme necessário


export function Products() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (name: string, price: number, weight: number, batch_package: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post(`/accounts/users/?token=${token}`, {
        email,
        cargo,
      });
      console.log("Login :", response.data);
      return true;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao criar usuário"
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductById = (id: string) => {
      const { data, error, isLoading } = useApiBase(
          `/products/?id=${id}`,
        );
        return {
            // id: data?.user.id ?? "",
            // primeiroNome: data?.user?.first_name ?? "",
            // ultimoNome: data?.user?.last_name ?? "",
            // email: data?.user?.email ?? "",
            // isAdminContabilidade: data?.user?.is_admin_contabilidade ?? false,
            // profilePicture: data?.user?.profile_picture ?? "",
            isLoading,
            isError: error ? String(error) : null,
        };
    }

    const getListProducts = (id: string) => {
        const { data, error, isLoading } = useApiBase(
            `/products/?id=${id}`,
          );
          return {
              // id: data?.user.id ?? "",
              // primeiroNome: data?.user?.first_name ?? "",
              // ultimoNome: data?.user?.last_name ?? "",
              // email: data?.user?.email ?? "",
              // isAdminContabilidade: data?.user?.is_admin_contabilidade ?? false,
              // profilePicture: data?.user?.profile_picture ?? "",
              isLoading,
              isError: error ? String(error) : null,
          };
      }
    
    
    return { create, isLoading, error, getProductById };


}
