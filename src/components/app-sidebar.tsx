"use client";

import * as React from "react";
import {
  IconHome,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconUsers,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/contexts/PermissionContext";
import { Profile } from "./profile";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isAdmin, userGroups } = usePermissions();

  // Lista completa de itens de navegação
  const allNavItems = [
    {
      title: "Painel de controle",
      url: "/dashboard",
      icon: IconHome,
      requiredGroups: ["admin", "sales_person", "delivery_person"],
    },
    {
      title: "Pedidos",
      url: "/dashboard/pedidos",
      icon: IconShoppingCart,
      requiredGroups: ["admin", "sales_person"],
    },
    {
      title: "Produtos",
      url: "/dashboard/produtos",
      icon: IconPackage,
      requiredGroups: ["admin"],
    },
    {
      title: "Logística",
      url: "/dashboard/logistica",
      icon: IconTruck,
      requiredGroups: ["admin"],
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: IconUsers,
      requiredGroups: ["admin", "sales_person"],
    },
    {
      title: "Entrega",
      url: "/dashboard/entrega",
      icon: IconTruckDelivery,
      requiredGroups: ["admin", "delivery_person"],
    },
  ];

  // Filtra os itens de navegação com base nas permissões do usuário
  const filteredNavItems = allNavItems.filter((item) => {
    // Admin tem acesso a tudo
    if (isAdmin) return true;

    // Verificar se o usuário pertence a algum dos grupos necessários
    return item.requiredGroups.some((group) => userGroups.includes(group));
  });

  return (
    <Sidebar collapsible="offcanvas" className="" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-4 py-2">
              <div className="text-xl font-medium text-gray-500">Logo</div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4 py-2 text-sm font-medium text-gray-500">Geral</div>
        <SidebarMenu className="h-full">
          {filteredNavItems.map((item) => {
            const isActive =
              (item.url === "/dashboard" && pathname === "/dashboard") ||
              (item.url !== "/dashboard" && pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  className={`${
                    isActive
                      ? "bg-orange-400 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <Link href={item.url}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
        <SidebarFooter>
          <Profile/>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}