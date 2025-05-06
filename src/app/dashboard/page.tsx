"use client";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, DollarSign, Landmark, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DialogUsuario } from "./dialog";
import { useReports } from "@/hooks/useStatistics";
import { report } from "process";

interface OrderUpdate {
  id: string;
  status: string;
}

export default function Page() {
  const [activeTab, setActiveTab] = useState("1");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sample order updates data
  const orderUpdates: OrderUpdate[] = [
    { id: "431", status: "Entrou em produção" },
    { id: "430", status: "Está pronto para entrega" },
    { id: "432", status: "Acabou de ser efetuado e está aguardando pagamento" },
    { id: "429", status: "Foi entregue com sucesso" },
    {
      id: "427",
      status: "Pagamento foi aprovado e brevemente entrará em produção",
    },
    { id: "426", status: "Foi entregue com sucesso" },
    {
      id: "425",
      status: "Pagamento foi aprovado e brevemente entrará em produção",
    },
    { id: "424", status: "Foi entregue com sucesso" },
    { id: "423", status: "Entrou em produção" },
    { id: "422", status: "Está pronto para entrega" },
  ];

  // Calculate total pages
  const totalPages = Math.ceil(orderUpdates.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orderUpdates.slice(indexOfFirstItem, indexOfLastItem);

  const days = parseInt(activeTab, 10);
  const { reports } = useReports(days)

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Dashboard" button={<DialogUsuario />} />

        <div className="px-4 lg:px-6">
          <h2 className="text-xl font-semibold mb-4">Visão geral</h2>

          {/* Period filters with Tabs */}
          <Tabs
            defaultValue="1"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="1">Hoje</TabsTrigger>
              <TabsTrigger value="7">7 dias</TabsTrigger>
              <TabsTrigger value="30">30 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vendas totais</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            +{reports?.total_sales}
          </CardTitle>
          <CardAction>
            <DollarSign className="size-4" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes cadastrados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            +{reports?.active_users}
          </CardTitle>
          <CardAction>
            <Users className="size-4" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Receita</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R${reports?.total_value}
          </CardTitle>
          <CardAction>
            <Landmark className="size-4" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vendedores ativos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            +21
          </CardTitle>
          <CardAction>
            <Activity className="size-4" />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
        {/* Latest updates section with table */}
        <div className="px-4 lg:px-6">
          <h2 className="text-xl font-semibold mb-4">Últimas atualizações</h2>
          <div className="rounded-md border">
            <table className="w-full">
              <tbody>
                {currentItems.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <h3 className="font-medium">Pedido #{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.status}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    size="default"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50 size-2"
                        : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === index + 1}
                      size="default"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(index + 1);
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    size="default"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
