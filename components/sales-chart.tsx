"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

type ChartDataPoint = {
  date: string
  total: number
}

const chartConfig = {
  total: {
    label: "Vendas",
    color: "var(--primary)",
  },
} satisfies ChartConfig

interface SalesChartProps {
  data: Sale[]
}

export function SalesChart({ data }: SalesChartProps) {

  // Group sales by date and sum totals
  const groupedData = React.useMemo((): ChartDataPoint[] => {
    const map = new Map<string, number>()

    data.forEach((sale) => {
      const date = new Date(sale.created_at).toLocaleDateString("pt-BR")
      const current = map.get(date) || 0
      map.set(date, current + sale.total)
    })

    return Array.from(map.entries())
      .map(([date, total]) => ({
        date,
        total: Math.round(total * 100) / 100,
      }))
      .sort((a, b) => {
        // Parse date strings to compare
        const [dayA, monthA, yearA] = a.date.split("/").map(Number)
        const [dayB, monthB, yearB] = b.date.split("/").map(Number)
        const dateA = new Date(yearA, monthA - 1, dayA)
        const dateB = new Date(yearB, monthB - 1, dayB)
        return dateA.getTime() - dateB.getTime()
      })
  }, [data])

  return (
    <Card className="@container/card flex flex-col h-full">
      <CardHeader>
        <CardTitle>Vendas do Mês</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total de vendas por dia
          </span>
          <span className="@[540px]/card:hidden">Vendas por dia</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-1 flex flex-col">
        {groupedData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto flex-1 w-full"
          >
            <AreaChart data={groupedData}>
              <defs>
                <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-total)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-total)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    formatter={(value) => {
                      const formatted = new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value as number)
                      return formatted
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="total"
                type="natural"
                fill="url(#fillTotal)"
                stroke="var(--color-total)"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Nenhuma venda para exibir
          </div>
        )}
      </CardContent>
    </Card>
  )
}
