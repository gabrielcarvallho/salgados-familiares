import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SalgadoItem } from "../types";

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salgados: SalgadoItem[];
  quantidadesDiarias: { [key: string]: string };
  onQuantidadeChange: (nome: string, valor: string) => void;
  onSalvar: () => void;
}

export function ConfigDialog({
  open,
  onOpenChange,
  salgados,
  quantidadesDiarias,
  onQuantidadeChange,
  onSalvar,
}: ConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Configurar quantidades diárias</DialogTitle>
          <DialogDescription>
            Configure a quantidade padrão para cada tipo de salgadinho produzido
            diariamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          {salgados.map((salgado) => (
            <div
              key={salgado.nome}
              className="grid grid-cols-6 items-center gap-4"
            >
              <label
                htmlFor={`quantidade-${salgado.nome}`}
                className="col-span-3 font-medium"
              >
                {salgado.nome}:
              </label>
              <Input
                id={`quantidade-${salgado.nome}`}
                className="col-span-3"
                type="number"
                placeholder="Quantidade diária"
                value={quantidadesDiarias[salgado.nome] || ""}
                onChange={(e) =>
                  onQuantidadeChange(salgado.nome, e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={onSalvar}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfigurarQuantidadesButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="bg-[#FF8F3F] text-white"
      variant="outline"
    >
      <Settings className="mr-2 h-4 w-4" />
      Configurar quantidades
    </Button>
  );
}
