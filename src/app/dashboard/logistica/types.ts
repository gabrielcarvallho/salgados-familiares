export interface SalgadoItem {
  nome: string;
  quantidade: number;
  pacotes: number;
  diferenca: number;
}

export interface PedidoItem {
  id: string;
  cliente: string;
  metodoPagamento: string;
  dataEntrega: string;
  status: "Em produção" | "Pronto para entrega" | "Entregue";
  valor: number;
  itens: {
    nome: string;
    quantidade: number;
    valorUnitario: number;
  }[];
  observacoes?: string;
  endereco?: string;
  telefone?: string;
}
