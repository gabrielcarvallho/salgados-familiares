import { useState } from "react";
import axiosInstance from "@/lib/axios";

export function createUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (email: string, cargo: string, token: string) => {
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

  return { create, isLoading, error };
}
