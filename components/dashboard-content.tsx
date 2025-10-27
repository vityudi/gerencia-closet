"use client"

import * as React from "react"
import { useSelectedStoreId } from "@/hooks/use-store"
import { SectionCards } from "@/components/section-cards"
import { SalesChart } from "@/components/sales-chart"
import { DashboardSalesTable } from "@/components/dashboard-sales-table"

type Sale = {
  id: string
  total: number
  created_at: string
  payment_method: string
  status: string
  team_member_id?: string
  team_members?: {
    id: string
    full_name: string
    role: string
  }
}

export function DashboardContent() {
  const storeId = useSelectedStoreId()
  const [sales, setSales] = React.useState<Sale[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!storeId) {
      setLoading(false)
      return
    }

    const fetchSales = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stores/${storeId}/sales`)
        const data = await response.json()

        console.log("Sales API response:", data)

        if (data.items) {
          // Use all sales (not filtered by month)
          setSales(data.items as Sale[])
        } else if (data.error) {
          console.error("Sales API error:", data.error)
          setSales([])
        }
      } catch (error) {
        console.error("Failed to fetch sales:", error)
        setSales([])
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [storeId])

  if (!storeId) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-xl bg-muted/50 p-8 text-center">
          <h2 className="text-lg font-semibold mb-2">Nenhuma loja selecionada</h2>
          <p className="text-muted-foreground">Selecione uma loja para visualizar o dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Layout principal: Cards 2x2 + Gráfico lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Cards de métricas em grid 2x2 - metade da largura */}
        <SectionCards />

        {/* Gráfico de vendas - outra metade da largura */}
        <div>
          {!loading && <SalesChart data={sales} />}
        </div>
      </div>

      {/* Tabela das 10 últimas vendas - ocupa toda a largura */}
      <div className="rounded-xl bg-muted/50 p-4">
        <h2 className="text-lg font-semibold mb-4">Últimas Vendas do Mês</h2>
        {!loading && <DashboardSalesTable data={sales} />}
      </div>
    </div>
  )
}
