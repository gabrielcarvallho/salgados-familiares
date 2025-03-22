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

interface AdicionarUsuarioButtonProps {
  setDialogOpen: (open: boolean) => void;
}

interface AdicionarUsuarioDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface OrderUpdate {
  id: string;
  status: string;
}

export default function Page() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("hoje");
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

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader title="Dashboard" />

        <div className="px-4 lg:px-6">
          <h2 className="text-xl font-semibold mb-4">Visão geral</h2>

          {/* Period filters with Tabs */}
          <Tabs
            defaultValue="hoje"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="hoje">Hoje</TabsTrigger>
              <TabsTrigger value="7dias">7 dias</TabsTrigger>
              <TabsTrigger value="30dias">30 dias</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <SectionCards />

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
      <AdicionarUsuarioDialog open={dialogOpen} setOpen={setDialogOpen} />
    </div>
  );
}

function AdicionarUsuarioButton({
  setDialogOpen,
}: AdicionarUsuarioButtonProps) {
  return (
    <Button
      onClick={() => setDialogOpen(true)}
      variant="outline"
      className="bg-[#FF8F3F] text-primary-foreground"
    >
      <Plus />
      Adicionar Usuário
    </Button>
  );
}

const AdicionarUsuarioDialog = ({
  open,
  setOpen,
}: AdicionarUsuarioDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Usuário</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar seu novo usuário
          </DialogDescription>
          <Input></Input>
          <Input></Input>
          <Select></Select>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button">
            Cancelar
          </Button>
          <Button type="submit">Criar usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
