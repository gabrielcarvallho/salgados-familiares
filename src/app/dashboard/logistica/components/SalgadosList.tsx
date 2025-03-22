import { SalgadoItem } from "../types";

interface SalgadosListProps {
  salgados: SalgadoItem[];
}

export function SalgadosList({ salgados }: SalgadosListProps) {
  return (
    <div className="px-4 lg:px-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Demanda de amanhã (10/03)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {salgados.map((salgado) => (
          <div key={salgado.nome} className="bg-white rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">{salgado.nome}</div>
            <div className="text-3xl font-bold mb-1">{salgado.quantidade}</div>
            <div className="text-xs text-gray-500">
              {salgado.pacotes} pacotes • {salgado.diferenca > 0 ? "+" : ""}
              {salgado.diferenca} que a quantidade diária
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
