"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useUser";
import {
  PermissionsContextType,
  PermissionsProviderProps,
  UserGroupName,
} from "@/types/Auth";
import { Group } from "@/types/User";
import { LoadingAnimation } from "@/components/ui/loading";

// Define quais rotas cada grupo pode acessar
const routePermissions: Record<UserGroupName, string[]> = {
  admin: [
    "/dashboard",
    "/dashboard/pedidos",
    "/dashboard/produtos",
    "/dashboard/logistica",
    "/dashboard/clientes",
    "/dashboard/entrega",
  ],
  sales_person: ["/dashboard/pedidos", "/dashboard/clientes"],
  delivery_person: ["/dashboard/entrega"],
};

// Define a página inicial para cada grupo após login
export const homeRoutes: Record<UserGroupName, string> = {
  admin: "/dashboard",
  sales_person: "/dashboard/pedidos",
  delivery_person: "/dashboard/entrega",
};

// Verifica se um usuário tem permissão para acessar uma rota específica
const hasPermission = (
  userGroups: string[],
  isAdmin: boolean,
  path: string
): boolean => {
  if (isAdmin) return true;
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

// Determina a página inicial do usuário com base em seus grupos
export const getUserHomePage = (
  userGroups: string[],
  isAdmin: boolean
): string => {
  if (isAdmin) return homeRoutes.admin;
  if (userGroups.includes("sales_person")) return homeRoutes.sales_person;
  if (userGroups.includes("delivery_person")) return homeRoutes.delivery_person;
  return "/dashboard";
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

  // Extrair grupos do usuário
  const userGroups = Array.isArray(user?.groups)
    ? user.groups.map((group: Group) => group.name)
    : [];
  const isAdmin = user?.is_admin || false;

  // Verifica se o usuário pode acessar a rota atual
  const canAccess = (path: string) => {
    if (!user) return false;
    return hasPermission(userGroups, isAdmin, path);
  };

  useEffect(() => {
    if (isRedirecting) return;

    // Redireciona não autenticados para login
    if (!isLoading && !user && !pathname.includes("/login")) {
      setIsRedirecting(true);
      router.push("/login");
      return;
    }

    // Verifica permissões para rota dashboard
    if (!isLoading && user) {
      if (pathname.startsWith("/dashboard") && !canAccess(pathname)) {
        const homePage = getUserHomePage(userGroups, isAdmin);
        setIsRedirecting(true);
        router.push(homePage);
      }
    }
  }, [user, isLoading, pathname, router, isRedirecting, userGroups, isAdmin]);

  // Enquanto estiver carregando, mostra um spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingAnimation />
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