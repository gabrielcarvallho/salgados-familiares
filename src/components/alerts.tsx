import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AlertDeleteProps {
  /** Controla se o diálogo está aberto */
  open: boolean;
  /** Função para alterar o estado de abertura */
  onOpenChange: (open: boolean) => void;
  /** Função chamada quando clica em "Deletar" */
  onConfirm: () => void;
  /** Botão que dispara o diálogo */
  trigger?: React.ReactNode;
}

export function AlertDelete({ open, onOpenChange, onConfirm }: AlertDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita. Ao excluir, não poderá ser restaurada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600">
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function AlertFinishWork({ open, onOpenChange, onConfirm }: AlertDeleteProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você deseja finalizar seu expediente?</AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser desfeita, ao finalizar expediente, seus pedidos irão para Logística e você não poderá mais editar seus pedidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction  onClick={onConfirm} className="bg-[#FF8F3F] text-white">
            Finalizar expediente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
