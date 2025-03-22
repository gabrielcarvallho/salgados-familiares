"use client";

import { DataTable, schema } from "./data-table";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";

const products = [
  {
    id: 1,
    nome: "Risólis",
    pacotesFornada: 50,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 2,
    nome: "Pastel de carne",
    pacotesFornada: 60,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 3,
    nome: "Coxinha de frango",
    pacotesFornada: 60,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 4,
    nome: "Folhado de carne",
    pacotesFornada: 20,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 5,
    nome: "Salsicha empanada",
    pacotesFornada: 10,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 6,
    nome: "Pastel de frango",
    pacotesFornada: 20,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 7,
    nome: "Kibe",
    pacotesFornada: 20,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 8,
    nome: "Esfirra",
    pacotesFornada: 60,
    preco: 5.0,
    pesoUnidade: "100g",
  },
  {
    id: 9,
    nome: "Pão de queijo",
    pacotesFornada: 50,
    preco: 5.0,
    pesoUnidade: "100g",
  },
];

interface AdicionarProdutoButtonProps {
  setDialogOpen: (open: boolean) => void;
}

interface AdicionarProdutoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function AdicionarProdutoButton({
  setDialogOpen,
}: AdicionarProdutoButtonProps) {
  return (
    <Button
      onClick={() => setDialogOpen(true)}
      variant="outline"
      className="bg-[#FF8F3F] text-primary-foreground"
    >
      <Plus />
      Adicionar Produto
    </Button>
  );
}

export default function ProductsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader
          title="Produtos"
          button={<AdicionarProdutoButton setDialogOpen={setDialogOpen} />}
        />
        <DataTable data={products} />
        <AdicionarProdutoDialog open={dialogOpen} setOpen={setDialogOpen} />
      </div>
    </div>
  );
}

const AdicionarProdutoDialog = ({
  open,
  setOpen,
}: AdicionarProdutoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar produto</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar seu produto
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="nome">Nome</label>
            <Input id="nome" placeholder="Insira o nome do produto" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="pacotes">Pacotes/Fornada</label>
            <Input
              id="pacotes"
              placeholder="Insira quantos pacotes fazem uma fornada"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="preco">Preço</label>
            <Input id="preco" placeholder="Insira o valor do produto" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="peso">Peso/unidade (g)</label>
            <Input id="peso" placeholder="Insira o peso unitário do produto" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#FF8F3F] text-primary-foreground"
          >
            Criar produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
