import { Badge } from "@/components/ui/badge";
import { PedidoItem } from "./types";

export const renderStatusBadge = (status: string) => {
  const statusMap = {
    "Em produção": "bg-orange-500 text-white border-orange-500",
    "Pronto para entrega": "bg-blue-500 text-white border-blue-500",
    Entregue: "bg-green-500 text-white border-green-500",
  };
  const className =
    statusMap[status as keyof typeof statusMap] ||
    "bg-gray-500 text-white border-gray-500";
  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
};

export const calcularValorTotal = (itens: PedidoItem["itens"]) => {
  return itens.reduce(
    (total, item) => total + item.quantidade * item.valorUnitario,
    0
  );
};
