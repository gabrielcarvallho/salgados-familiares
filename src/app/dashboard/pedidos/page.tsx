"use client";
import { DataTable } from "@/app/dashboard/pedidos/data-table";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

import { Plus } from "lucide-react";
import { useState } from "react";
import pedidosData from "./data.json";
import { ProdutoSelector } from "./ProdutoSelector";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdicionarPedidoButtonProps {
  setDialogOpen: (open: boolean) => void;
}

interface AdicionarPedidoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Dados mockados para exemplificar
const clientes = [
  { id: "1", nome: "Maurício" },
  { id: "2", nome: "Patrícia" },
];

const metodosPagamento = [
  { id: "1", nome: "Pix" },
  { id: "2", nome: "Boleto" },
];

const statusPedido = [
  { id: "1", nome: "Em produção" },
  { id: "2", nome: "Pagamento pendente" },
];

export default function PedidosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <SiteHeader
        title="Pedidos"
        button={<AdicionarPedidoButton setDialogOpen={setDialogOpen} />}
      />
      <DataTable data={pedidosData} />
      <AdicionarPedidoDialog open={dialogOpen} setOpen={setDialogOpen} />
    </div>
  );
}

function AdicionarPedidoButton({ setDialogOpen }: AdicionarPedidoButtonProps) {
  return (
    <Button
      onClick={() => setDialogOpen(true)}
      variant="outline"
      className="bg-[#FF8F3F] text-primary-foreground"
    >
      <Plus />
      Adicionar Pedido
    </Button>
  );
}

const AdicionarPedidoDialog = ({
  open,
  setOpen,
}: AdicionarPedidoDialogProps) => {
  const [cliente, setCliente] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("");
  const [dataEntrega, setDataEntrega] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para adicionar o pedido
    console.log({ cliente, metodoPagamento, dataEntrega, status });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar pedido</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para criar seu pedido
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={cliente} onValueChange={setCliente}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="outros">...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dataEntrega">Data de entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !dataEntrega && "text-muted-foreground"
                    )}
                  >
                    {dataEntrega
                      ? format(dataEntrega, "PPP", { locale: ptBR })
                      : "Selecione uma data..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataEntrega}
                    onSelect={setDataEntrega}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metodoPagamento">Método de pagamento</Label>
              <Select
                value={metodoPagamento}
                onValueChange={setMetodoPagamento}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método de pagamento..." />
                </SelectTrigger>
                <SelectContent>
                  {metodosPagamento.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="outros">...</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salgadinhos">Salgadinhos</Label>
              <ProdutoSelector />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status do pedido</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status atual..." />
                </SelectTrigger>
                <SelectContent>
                  {statusPedido.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                  <SelectItem value="outros">...</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FF8F3F] text-primary-foreground hover:bg-[#FF8F3F]/90"
            >
              Adicionar pedido
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
