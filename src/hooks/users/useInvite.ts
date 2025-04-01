import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export function useInvite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = async (email: string, isAdmin: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/accounts/users/invite", {
        email,
        isAdmin,
      });
      console.log("Login :", response.data);
      return true;
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Ocorreu um erro ao enviar convite",
      );
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
