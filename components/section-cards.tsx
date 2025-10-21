"use client"

import * as React from "react"
import { IconTrendingUp } from "@tabler/icons-react"
import { useSelectedStoreId } from "@/hooks/use-store"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Sale = {
  id: string
  total: number
  created_at: string
  payment_method: string
  status: string
}

type Customer = {
  id: string
  name: string
  created_at: string
}

type Product = {
  id: string
  stock: number
}

export function SectionCards() {
  const storeId = useSelectedStoreId()
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    totalSales: 0,
    newCustomers: 0,
    totalStock: 0,
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!storeId) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        const [salesRes, customersRes, productsRes] = await Promise.all([
          fetch(`/api/stores/${storeId}/sales`),
          fetch(`/api/stores/${storeId}/customers`),
          fetch(`/api/stores/${storeId}/products`),
        ])

        const salesData = await salesRes.json()
        const customersData = await customersRes.json()
        const productsData = await productsRes.json()

        console.log("Stats data:", { salesData, customersData, productsData })

        // Calculate stats
        let totalRevenue = 0
        let completedSales = 0

        if (Array.isArray(salesData.items)) {
          salesData.items.forEach((sale: Sale) => {
            if (sale.status === "Concluída") {
              totalRevenue += Number(sale.total) || 0
              completedSales += 1
            }
          })
        }

        let newCustomersCount = 0
        if (Array.isArray(customersData.items)) {
          const now = new Date()
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

          newCustomersCount = customersData.items.filter((customer: Customer) => {
            const createdDate = new Date(customer.created_at)
            return createdDate >= thirtyDaysAgo
          }).length
        }

        let totalStock = 0
        if (Array.isArray(productsData.items)) {
          totalStock = productsData.items.reduce(
            (sum: number, product: Product) => sum + (product.stock || 0),
            0
          )
        }

        setStats({
          totalRevenue,
          totalSales: completedSales,
          newCustomers: newCustomersCount,
          totalStock,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [storeId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 h-[400px] *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Receita Total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : formatCurrency(stats.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +15.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Crescimento este mês <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de vendas concluídas
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Novos Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : stats.newCustomers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Crescimento positivo <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Últimos 30 dias
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Produtos em Estoque</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : stats.totalStock}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +5.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Estoque bem gerenciado <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Controle de inventário eficiente</div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Total de Vendas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {loading ? "—" : stats.totalSales}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.8%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm mt-auto">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Performance excelente <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Vendas concluídas e confirmadas</div>
        </CardFooter>
      </Card>
    </div>
  )
}
