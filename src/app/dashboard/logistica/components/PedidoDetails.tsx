import { PedidoItem } from "../types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PedidoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedido: PedidoItem | null;
  novoStatus: string;
  onStatusChange: (status: string) => void;
  onUpdateStatus: () => void;
}

export function PedidoDetails({
  open,
  onOpenChange,
  pedido,
  novoStatus,
  onStatusChange,
  onUpdateStatus,
}: PedidoDetailsProps) {
  if (!pedido) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Pedido #{pedido.id}</SheetTitle>
          <SheetDescription>
            Informações do pedido de {pedido.cliente}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Informações gerais do pedido */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Informações do Pedido</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Cliente:</div>
              <div>{pedido.cliente}</div>

              <div className="font-medium">Data de Entrega:</div>
              <div>{pedido.dataEntrega}</div>

              <div className="font-medium">Método de Pagamento:</div>
              <div>{pedido.metodoPagamento}</div>

              <div className="font-medium">Valor Total:</div>
              <div>R$ {pedido.valor.toFixed(2)}</div>

              {pedido.telefone && (
                <>
                  <div className="font-medium">Telefone:</div>
                  <div>{pedido.telefone}</div>
                </>
              )}

              {pedido.endereco && (
                <>
                  <div className="font-medium">Endereço:</div>
                  <div>{pedido.endereco}</div>
                </>
              )}
            </div>
          </div>

          {/* Itens do pedido */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Itens do Pedido</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedido.itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.nome}</TableCell>
                      <TableCell className="text-right">
                        {item.quantidade}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {item.valorUnitario.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {(item.quantidade * item.valorUnitario).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Observações */}
          {pedido.observacoes && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Observações</h3>
              <p className="text-sm">{pedido.observacoes}</p>
            </div>
          )}

          {/* Status do pedido - única parte editável */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Status do Pedido</h3>
            <Select value={novoStatus} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Em produção">Em produção</SelectItem>
                <SelectItem value="Pronto para entrega">
                  Pronto para entrega
                </SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={onUpdateStatus}
          >
            Atualizar status
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
