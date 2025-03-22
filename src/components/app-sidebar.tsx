"use client";

import * as React from "react";
import {
  IconHome,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconUsers,
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
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Painel de controle",
      url: "/dashboard",
      icon: IconHome,
    },
    {
      title: "Pedidos",
      url: "/dashboard/pedidos",
      icon: IconShoppingCart,
    },
    {
      title: "Produtos",
      url: "/dashboard/produtos",
      icon: IconPackage,
    },
    {
      title: "Logística",
      url: "/dashboard/logistica",
      icon: IconTruck,
    },
    {
      title: "Clientes",
      url: "/dashboard/clientes",
      icon: IconUsers,
    },
  ];

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
        <SidebarMenu>
          {navItems.map((item) => {
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
      </SidebarContent>
    </Sidebar>
  );
}
