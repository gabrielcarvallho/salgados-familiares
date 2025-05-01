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
import { DialogPedidos } from "./dialog";


export default function PedidosPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <SiteHeader
        title="Pedidos"
        button={<DialogPedidos/>}
      />
      <DataTable data={pedidosData} />
    </div>
  );
}


