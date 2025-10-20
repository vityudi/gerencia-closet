import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 h-[400px] *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Receita Total</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            R$ 12.450,00
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
            Vendas dos últimos 6 meses
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Novos Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            234
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
            Aquisição de clientes estável
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card h-full flex flex-col">
        <CardHeader>
          <CardDescription>Produtos em Estoque</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1.456
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
          <CardDescription>Taxa de Crescimento</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12.8%
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
          <div className="text-muted-foreground">Supera projeções de crescimento</div>
        </CardFooter>
      </Card>
    </div>
  )
}
