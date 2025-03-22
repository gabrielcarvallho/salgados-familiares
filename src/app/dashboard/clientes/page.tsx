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
import { Plus } from "lucide-react";
import { useState } from "react";

// Mock data for clients
const clients = [
  {
    id: 1,
    razaoSocial: "Empresa ABC Ltda",
    nomeFantasia: "ABC Alimentos",
    cnpj: "12.345.678/0001-90",
    inscricaoEstadual: "123456789",
    endereco: "Rua das Flores, 123",
    email: "contato@abcalimentos.com",
    emailContato: "compras@abcalimentos.com",
    nomeContato: "João Silva",
    cargo: "Comprador",
    dataNascimento: "15/05/1980",
    telefoneContato: "(11) 98765-4321",
  },
  {
    id: 2,
    razaoSocial: "Restaurante Sabor e Arte Ltda",
    nomeFantasia: "Sabor e Arte",
    cnpj: "23.456.789/0001-12",
    inscricaoEstadual: "234567890",
    endereco: "Av. Principal, 456",
    email: "contato@saborarte.com",
    emailContato: "chef@saborarte.com",
    nomeContato: "Maria Oliveira",
    cargo: "Chef",
    dataNascimento: "22/07/1975",
    telefoneContato: "(11) 91234-5678",
  },
];

interface AdicionarClienteButtonProps {
  setDialogOpen: (open: boolean) => void;
}

interface AdicionarClienteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function AdicionarClienteButton({
  setDialogOpen,
}: AdicionarClienteButtonProps) {
  return (
    <Button
      onClick={() => setDialogOpen(true)}
      variant="outline"
      className="bg-[#FF8F3F] text-primary-foreground"
    >
      <Plus />
      Adicionar Cliente
    </Button>
  );
}

export default function ClientsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader
          title="Clientes"
          button={<AdicionarClienteButton setDialogOpen={setDialogOpen} />}
        />
        <DataTable data={clients} />
        <AdicionarClienteDialog open={dialogOpen} setOpen={setDialogOpen} />
      </div>
    </div>
  );
}

// Masks for input fields
const applyMask = {
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  },
  phone: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2")
      .slice(0, 15);
  },
  date: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .slice(0, 10);
  },
};

const AdicionarClienteDialog = ({
  open,
  setOpen,
}: AdicionarClienteDialogProps) => {
  const [formData, setFormData] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    inscricaoEstadual: "",
    endereco: "",
    email: "",
    emailContato: "",
    nomeContato: "",
    cargo: "",
    dataNascimento: "",
    telefoneContato: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let maskedValue = value;
    if (name === "cnpj") {
      maskedValue = applyMask.cnpj(value);
    } else if (name === "telefoneContato") {
      maskedValue = applyMask.phone(value);
    } else if (name === "dataNascimento") {
      maskedValue = applyMask.date(value);
    }

    setFormData({
      ...formData,
      [name]: maskedValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Implement client registration logic here
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Cadastrar cliente</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar o cliente à sua lista
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="razaoSocial">Razão social</label>
              <Input
                id="razaoSocial"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                placeholder="Insira a razão social do cliente"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="nomeContato">Nome para contato</label>
              <Input
                id="nomeContato"
                name="nomeContato"
                value={formData.nomeContato}
                onChange={handleChange}
                placeholder="Insira o nome para contato"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="nomeFantasia">Nome fantasia</label>
              <Input
                id="nomeFantasia"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                placeholder="Insira o nome fantasia do cliente"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cargo">Cargo</label>
              <Input
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                placeholder="Insira o cargo do representante"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="cnpj">CNPJ</label>
              <Input
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="Insira o CNPJ do cliente"
                maxLength={18}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="dataNascimento">Data de nascimento</label>
              <Input
                id="dataNascimento"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleChange}
                placeholder="Insira a data de nascimento do representante"
                maxLength={10}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="inscricaoEstadual">Inscrição estadual</label>
              <Input
                id="inscricaoEstadual"
                name="inscricaoEstadual"
                value={formData.inscricaoEstadual}
                onChange={handleChange}
                placeholder="Insira inscrição estadual, ou não"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="telefoneContato">Telefone para contato</label>
              <Input
                id="telefoneContato"
                name="telefoneContato"
                value={formData.telefoneContato}
                onChange={handleChange}
                placeholder="Insira o telefone do representante"
                maxLength={15}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email">E-mail</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Insira o e-mail da empresa do cliente"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="emailContato">E-mail para contato</label>
              <Input
                id="emailContato"
                name="emailContato"
                type="email"
                value={formData.emailContato}
                onChange={handleChange}
                placeholder="Insira o e-mail do representante"
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2">
              <label htmlFor="endereco">Endereço</label>
              <Input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Insira o endereço da empresa do cliente"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#FF8F3F] text-primary-foreground"
            >
              Cadastrar cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
