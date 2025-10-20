import { SectionCards } from "@/components/section-cards"
import { ProductsTable } from "@/components/products-table"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import data from "./data.json"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Layout principal: Cards 2x2 + Gráfico lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cards de métricas em grid 2x2 - metade da largura */}
        <SectionCards />
        
        {/* Gráfico - outra metade da largura */}
        <div>
          <ChartAreaInteractive />
        </div>
      </div>
      
      {/* Tabela de produtos - ocupa toda a largura */}
      <div className="rounded-xl bg-muted/50 p-4">
        <h2 className="text-lg font-semibold mb-4">Produtos em Destaque</h2>
        <ProductsTable data={data} />
      </div>
    </div>
  )
}
