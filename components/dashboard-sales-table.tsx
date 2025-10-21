"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUser,
  IconCreditCard,
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "created_at",
    header: "Data/Hora",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-sm">
          <div className="font-medium">{date.toLocaleDateString("pt-BR")}</div>
          <div className="text-muted-foreground text-xs">
            {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: "Valor",
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(total)
      return <div className="font-medium text-lg">{formatted}</div>
    },
  },
  {
    accessorKey: "payment_method",
    header: "Pagamento",
    cell: ({ row }) => {
      const method = row.getValue("payment_method") as string
      return (
        <div className="flex items-center gap-2">
          <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">{method}</Badge>
        </div>
      )
    },
  },
  {
    id: "seller",
    header: "Vendedor",
    cell: ({ row }) => {
      const seller = row.original.team_members
      if (!seller) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div className="font-medium">{seller.full_name}</div>
            <div className="text-xs text-muted-foreground">{seller.role}</div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant =
        status === "Concluída" ? "default" :
        status === "Pendente" ? "secondary" :
        "destructive"
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <IconEdit className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <IconTrash className="mr-2 h-4 w-4" />
            Cancelar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

interface DashboardSalesTableProps {
  data: Sale[]
}

export function DashboardSalesTable({ data }: DashboardSalesTableProps) {
  // Get only the last 10 sales
  const lastTenSales = React.useMemo(() => {
    return data.slice(0, 10)
  }, [data])

  const table = useReactTable({
    data: lastTenSales,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
