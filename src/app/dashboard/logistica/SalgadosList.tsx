import { getTomorrowDayMonth } from "@/lib/utils"
import type { ProductionScheduleResponse } from "@/types/Logistics"
import { Package, Layers, Calendar, ClipboardX } from 'lucide-react'

interface SalgadosListProps {
  salgados: ProductionScheduleResponse[]
}

export function SalgadosList({ salgados }: SalgadosListProps) {
  function getTomorrowFormatted(): string {
    const { day, month } = getTomorrowDayMonth()
    const dd = String(day).padStart(2, "0")
    const mm = String(month).padStart(2, "0")
    return `${dd}/${mm}`
  }

  const diaAmanha = getTomorrowFormatted()
  const hasSalgados = salgados.length > 0

  return (
    <div className="px-4 lg:px-6 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-5 w-5 text-orange-500" />
        <h2 className="text-2xl font-bold">
          Demanda de amanhã <span className="text-orange-500">({diaAmanha})</span>
        </h2>
      </div>

      {hasSalgados ? (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          {salgados.map((salgado) => (
            <div
              key={salgado.product_name}
              className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
            >
              <div className="text-lg font-bold mb-3 pb-2 border-b text-gray-800">{salgado.product_name}</div>

              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Pacotes</div>
                  <div className="text-2xl font-bold text-gray-900">{salgado.total_packages}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Lotes</div>
                  <div className="text-2xl font-bold text-gray-900">{salgado.total_batches}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <ClipboardX className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sem demanda para amanhã</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Não há pedidos programados para produção no dia {diaAmanha}. Verifique novamente mais tarde ou entre em contato com o setor de vendas.
          </p>
        </div>
      )}
    </div>
  )
}
