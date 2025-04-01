import { useState } from "react";
import axiosInstance from "@/lib/axios";

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await axiosInstance.post("/accounts/token/logout/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao realizar logout");
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading, error };
}
