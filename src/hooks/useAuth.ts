import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useApiBase } from "./api/useApiBase";
import { Group, UserResponse } from "@/types/User";
import { Login } from "@/types/Auth";
import { handleApiError } from "./api/apiErrorHandler";
import { getUserHomePage } from "./contexts/PermissionContext";
import { useCurrentUser } from "./useUser";


// Hook para obter grupos de autorização (usando SWR)
export function useAuthGroups() {
  const { data, error, isLoading } = useApiBase<Group>(`/accounts/groups/`);
  return {
    groups: data ?? [],
    isLoading,
    isError: error ? String(error) : null,
  };
}

// Hook para operações de autenticação (login/logout)
export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const homeRoutes = {
    admin: "/dashboard",
    sales_person: "/dashboard/pedidos",
    delivery_person: "/dashboard/entrega",
  };

  const getUserHomePage = (userData: UserResponse) => {
    if (userData.is_admin) return homeRoutes.admin;
    
    const userGroups = userData.groups || [];
    const groupNames = userGroups.map(group => group.name);
    
    if (groupNames.includes("sales_person")) return homeRoutes.sales_person;
    if (groupNames.includes("delivery_person")) return homeRoutes.delivery_person;
    
    return "/dashboard";
  };
  
  const login = async (loginData: Login) => {
    setIsLoading(true);
    setError(null);
  
    try {
      // 1) Faz o login
      await axiosInstance.post("/accounts/token/", loginData);
      
      // 2) Obtém os dados do usuário atual (não de todos os usuários)
      const response = await axiosInstance.get<UserResponse>("/accounts/users/");
      const user = response.data;
  
      // 3) Determina o redirecionamento com base no tipo de usuário
      const redirectUrl = getUserHomePage(user);
      router.push(redirectUrl);
  
      return true;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };
  

  const logout = async () => {
    setIsLoading(true);
    setError(null);
  
    try {
      await axiosInstance.post("/accounts/token/logout/");
      router.push("/dashboard");
      return true;
    } catch (error) {
      const formattedError = handleApiError(error);
      setError(formattedError.message);
      throw formattedError;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login, logout };
}