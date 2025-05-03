import { Badge } from "@/components/ui/badge";

export default function teste() {
  return (
    <div>
      <div>
        <Badge variant={"prontoEntrega"}>Pronta entrega</Badge>
      </div>
      <div>
        <Badge variant={"aguardoExpediente"}>Aguardo Expediente</Badge>
      </div>
      <div>
        <Badge variant={"emProducao"}>Em Producao</Badge>
      </div>
      <div>
        <Badge variant={"entregue"}>Entregue</Badge>
      </div>
      <div>
        <Badge variant={"pagamentoPendente"}>Pagamento pendente</Badge>
      </div>
      <div>
        <Badge variant={"pagamentoAprovado"}>Pagamento aprovado</Badge>
      </div>
      <div>
        <Badge variant={"concluido"}>Concluido</Badge>
      </div>
    </div>
  );
}
