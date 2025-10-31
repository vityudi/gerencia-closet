"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUser,
  IconCreditCard,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
} from "@tabler/icons-react"
import { useCart } from "@/contexts/cart-context"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
type Product = {
  id: string
  codigo: string
  name: string
  descricao?: string
}

type SaleItem = {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  products?: Product
}

type Sale = {
  id: string
  total: number
  created_at: string
  payment_method: string
  status: string
  team_member_id?: string
  customer_id?: string
  team_members?: {
    id: string
    full_name: string
    role: string
  }
  customers?: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  sale_items?: SaleItem[]
}

const columns: ColumnDef<Sale>[] = [
  {
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <button
        onClick={() => row.toggleExpanded()}
        className="p-0 h-8 w-8 flex items-center justify-center hover:bg-accent rounded"
      >
        {row.getIsExpanded() ? (
          <IconChevronUp className="h-4 w-4" />
        ) : (
          <IconChevronDown className="h-4 w-4" />
        )}
      </button>
    ),
  },
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
    filterFn: (row, id, value) => {
      const date = new Date(row.getValue(id) as string)
      const dateStr = date.toLocaleDateString("pt-BR")
      const timeStr = date.toLocaleTimeString("pt-BR")
      const seller = row.original.team_members?.full_name || ""
      const customer = row.original.customers?.full_name || ""
      const payment = row.getValue("payment_method") as string
      const total = row.getValue("total") as number

      return dateStr.includes(value.toLowerCase()) ||
             timeStr.includes(value.toLowerCase()) ||
             seller.toLowerCase().includes(value.toLowerCase()) ||
             customer.toLowerCase().includes(value.toLowerCase()) ||
             payment.toLowerCase().includes(value.toLowerCase()) ||
             total.toString().includes(value)
    },
  },
  {
    id: "customer",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original.customers
      if (!customer) {
        return <span className="text-sm text-muted-foreground">—</span>
      }
      return (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div className="font-medium">{customer.full_name}</div>
            <div className="text-xs text-muted-foreground">{customer.email}</div>
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

interface SalesTableProps {
  data: Sale[]
  onSaleCreated?: () => void
}

export function SalesTable({ data }: SalesTableProps) {
  const { setIsModalOpen, setDefaultTab } = useCart()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por data, cliente, vendedor, pagamento ou valor..."
            value={(table.getColumn("created_at")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("created_at")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setDefaultTab("add-product")
            setIsModalOpen(true)
          }}
        >
          <IconPlus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>
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
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.column.id === "expand" ? (
                          <button
                            onClick={() => toggleRowExpanded(row.id)}
                            className="p-0 h-8 w-8 flex items-center justify-center hover:bg-accent rounded"
                          >
                            {expandedRows[row.id] ? (
                              <IconChevronUp className="h-4 w-4" />
                            ) : (
                              <IconChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows[row.id] && row.original.sale_items && row.original.sale_items.length > 0 && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={columns.length} className="p-4">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">Produtos ({row.original.sale_items.length}):</p>
                          <div className="space-y-1">
                            {row.original.sale_items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm p-3 bg-background rounded border">
                                <div className="flex-1">
                                  {item.products ? (
                                    <>
                                      <p className="font-medium text-base">{item.products.name}</p>
                                      <p className="text-xs text-muted-foreground">Código: {item.products.codigo}</p>
                                      {item.products.descricao && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.products.descricao}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.quantity}x {new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(item.unit_price)}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="font-medium">Produto ID: {item.product_id}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {item.quantity}x {new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(item.unit_price)}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">{new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(item.subtotal)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} venda(s) total.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
