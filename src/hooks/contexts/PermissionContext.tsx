"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser, useUser } from "@/hooks/useUser"; // Assumindo que este hook existe conforme mencionado
import {
  PermissionsContextType,
  PermissionsProviderProps,
  UserGroup,
  UserGroupName,
} from "@/types/Auth";
import { Group } from "@/types/User";

// Define os tipos de permissões por grupo

// Define quais rotas cada grupo pode acessar
const routePermissions: Record<UserGroupName, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/pedidos",
    "/dashboard/produtos",
    "/dashboard/logistica",
    "/dashboard/clientes",
    "/dashboard/entregadores", // Rota adicional para entregadores
  ],
  sales_person: ["/dashboard", "/dashboard/pedidos", "/dashboard/clientes"],
  delivery_person: ["/dashboard", "/dashboard/entregadores"],
};

// Verifica se um usuário tem permissão para acessar uma rota específica
const hasPermission = (
  userGroups: string[],
  isAdmin: boolean,
  path: string
): boolean => {
  // Admin tem acesso a tudo
  if (isAdmin) return true;

  // Verificar permissões baseadas no grupo
  for (const group of userGroups) {
    if (
      group === "sales_person" &&
      routePermissions.sales_person.some((route) => path.startsWith(route))
    ) {
      return true;
    }
    if (
      group === "delivery_person" &&
      routePermissions.delivery_person.some((route) => path.startsWith(route))
    ) {
      return true;
    }
  }

  return false;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Definir tipos para o objeto de usuário e grupos

  // Extrair grupos do usuário
  const userGroups = Array.isArray(user?.groups)
    ? user.groups.map((group: Group) => group.name)
    : [];
  const isAdmin = user?.is_admin || false;

  // Verificar se o usuário pode acessar a rota atual
  const canAccess = (path: string) => {
    // Se não estiver autenticado, não pode acessar
    if (!user) return false;
    return hasPermission(userGroups, isAdmin, path);
  };

  useEffect(() => {
    // Evita loops de redirecionamento
    if (isRedirecting) return;

    // Verifica se o usuário está autenticado
    if (!isLoading && !user && !pathname.includes("/login")) {
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // Verifica permissões para a rota atual, se o usuário estiver logado
    if (!isLoading && user && pathname.startsWith("/dashboard")) {
      const hasAccess = canAccess(pathname);

      if (!hasAccess) {
        setIsRedirecting(true);
        router.push("/dashboard"); // Redireciona para o dashboard principal
      }
    }
  }, [user, isLoading, pathname, router]);

  // Enquanto estiver carregando, mostra um spinner ou tela de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <PermissionsContext.Provider
      value={{
        isAdmin,
        userGroups,
        canAccess,
        isLoading,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}
