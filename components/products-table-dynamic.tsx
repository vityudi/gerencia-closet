"use client"

import * as React from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconSearch,
} from "@tabler/icons-react"
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

export type Product = {
  id: string
  codigo: string
  name: string
  marca?: string
  categoria?: string
  subcategoria?: string
  grupo?: string
  subgrupo?: string
  departamento?: string
  secao?: string
  estacao?: string
  colecao?: string
  descricao?: string
  observacao?: string
  fabricante?: string
  fornecedor?: string
  ncm?: string
  cest?: string
  custo?: number
  preco1?: number
  preco2?: number
  preco3?: number
  stock: number
  sku?: string
  price?: number
  created_at?: string
  product_variations?: Array<{
    id: string
    attribute_id: string
    value: string
    product_attributes: { id: string; name: string; label: string }
  }>
}

interface ProductColumn {
  id: string
  field_name: string
  label: string
  is_visible: boolean
  is_editable: boolean
  position: number
  column_type: string
  width: string
}

function formatValue(value: unknown, columnType: string): string {
  if (value === null || value === undefined) return '-'

  switch (columnType) {
    case 'currency':
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(parseFloat(String(value)) || 0)
      return formatted
    case 'number':
      return new Intl.NumberFormat('pt-BR').format(parseFloat(String(value)) || 0)
    case 'date':
      return new Date(String(value)).toLocaleDateString('pt-BR')
    default:
      return String(value)
  }
}

function getDynamicColumns(
  columnConfig: ProductColumn[],
  onEdit?: (product: Product) => void
): ColumnDef<Product>[] {
  const visibleColumns = columnConfig
    .filter((col) => col.is_visible)
    .sort((a, b) => a.position - b.position)

  const columns: ColumnDef<Product>[] = visibleColumns.map((col) => ({
    accessorKey: col.field_name,
    header: col.label,
    cell: ({ row }) => {
      const value = row.getValue(col.field_name)
      const displayValue = formatValue(value, col.column_type)

      // Special handling for stock - show badge
      if (col.field_name === 'stock') {
        const stock = value as number
        const variant = stock > 20 ? 'default' : stock > 10 ? 'secondary' : 'destructive'
        return (
          <div className="flex items-center gap-2">
            <Badge variant={variant}>{displayValue}</Badge>
          </div>
        )
      }

      // Special handling for variations
      if (col.field_name === 'product_variations') {
        const variations = (row.original.product_variations || []) as Array<{
          id: string
          attribute_id: string
          value: string
          product_attributes: { id: string; name: string; label: string }
        }>
        if (variations.length === 0) return <div className="text-sm text-gray-500">-</div>

        const groupedByAttribute: Record<string, string[]> = {}
        variations.forEach((v) => {
          const attrName = v.product_attributes?.label || v.attribute_id
          if (!groupedByAttribute[attrName]) {
            groupedByAttribute[attrName] = []
          }
          groupedByAttribute[attrName].push(v.value)
        })

        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(groupedByAttribute).map(([attr, values]) => (
              <Badge key={attr} variant="outline" className="text-xs">
                {attr}: {values.join(', ')}
              </Badge>
            ))}
          </div>
        )
      }

      // Default text rendering
      return (
        <div
          className={`text-sm ${
            col.column_type === 'currency' ? 'text-right font-medium' : ''
          }`}
        >
          {col.column_type === 'textarea' && displayValue.length > 50
            ? `${displayValue.substring(0, 50)}...`
            : displayValue}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string
      return cellValue?.toString().toLowerCase().includes(value.toLowerCase())
    },
  }))

  // Add actions column
  columns.push({
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(product)}>
              <IconEdit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <IconTrash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  })

  return columns
}

export function ProductsTableDynamic({
  data,
  onEdit,
  columnConfig,
}: {
  data: Product[]
  onEdit?: (product: Product) => void
  columnConfig: ProductColumn[]
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns = React.useMemo(
    () => getDynamicColumns(columnConfig as ProductColumn[], onEdit),
    [columnConfig, onEdit]
  )

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

  // Find first searchable column (codigo, name, or first available column)
  const searchColumn = React.useMemo(() => {
    // Try to find codigo or name columns
    const preferredColumn = columns.find((col) =>
      ['codigo', 'name'].includes(col.id ?? '')
    )?.id

    if (preferredColumn) {
      return preferredColumn
    }

    // Fallback to first column that's not actions
    const firstColumn = columns.find((col) => col.id !== 'actions')?.id

    return firstColumn || 'codigo'
  }, [columns])

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={
              (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
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
                  data-state={row.getIsSelected() && 'selected'}
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
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} produto(s) total.
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
