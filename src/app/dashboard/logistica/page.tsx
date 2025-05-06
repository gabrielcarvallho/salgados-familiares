"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SalgadosList } from "./components/SalgadosList";
import { PedidosList } from "./components/PedidosList";
import {
  ConfigDialog,
  ConfigurarQuantidadesButton,
} from "./components/ConfigDialog";
import { PedidoDetails } from "./components/PedidoDetails";
import { PedidoItem } from "./types";
import { salgadosData, pedidosData } from "./data";
import { useProductionSchedule } from '../../../hooks/useStatistics';

export default function LogisticaPage() {
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [openPedidoSheet, setOpenPedidoSheet] = useState(false);
  const [quantidadesDiarias, setQuantidadesDiarias] = useState<{
    [key: string]: string;
  }>({});
  const [pedidos, setPedidos] = useState<PedidoItem[]>(pedidosData);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoItem | null>(
    null
  );
  const [novoStatus, setNovoStatus] = useState<string>("");

const { productionSchedule } = useProductionSchedule()

  // Inicializa as quantidades diárias
  useEffect(() => {
    const initialQuantidades: { [key: string]: string } = {};
    salgadosData.forEach((salgado) => {
      initialQuantidades[salgado.nome] = "";
    });
    setQuantidadesDiarias(initialQuantidades);
  }, []);

  const handleQuantidadeChange = (nome: string, valor: string) => {
    setQuantidadesDiarias({
      ...quantidadesDiarias,
      [nome]: valor,
    });
  };

  const handleSalvarQuantidades = () => {
    // Aqui você implementaria a lógica para salvar as quantidades no backend
    console.log("Quantidades salvas:", quantidadesDiarias);
    setOpenConfigDialog(false);
  };

  const handleRowClick = (pedido: PedidoItem) => {
    setPedidoSelecionado(pedido);
    setNovoStatus(pedido.status);
    setOpenPedidoSheet(true);
  };

  const handleUpdateStatus = () => {
    if (pedidoSelecionado && novoStatus) {
      setPedidos(
        pedidos.map((p) =>
          p.id === pedidoSelecionado.id
            ? { ...p, status: novoStatus as any }
            : p
        )
      );
      setOpenPedidoSheet(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <SiteHeader
          title="Logística"
          button={
            <ConfigurarQuantidadesButton
              onClick={() => setOpenConfigDialog(true)}
            />
          }
        />

        {/* Demanda de amanhã */}
        <SalgadosList salgados={productionSchedule} />

        {/* Últimos pedidos */}
        <PedidosList pedidos={pedidos} onPedidoClick={handleRowClick} />
      </div>

      {/* Dialog para configurar quantidades */}
      <ConfigDialog
        open={openConfigDialog}
        onOpenChange={setOpenConfigDialog}
        salgados={salgadosData}
        quantidadesDiarias={quantidadesDiarias}
        onQuantidadeChange={handleQuantidadeChange}
        onSalvar={handleSalvarQuantidades}
      />

      {/* Sheet para visualizar detalhes do pedido */}
      <PedidoDetails
        open={openPedidoSheet}
        onOpenChange={setOpenPedidoSheet}
        pedido={pedidoSelecionado}
        novoStatus={novoStatus}
        onStatusChange={setNovoStatus}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
