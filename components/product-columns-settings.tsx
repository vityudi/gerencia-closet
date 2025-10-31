'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/contexts/store-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { IconTrash, IconEdit, IconGripVertical, IconPlus, IconEye, IconEyeOff, IconList } from '@tabler/icons-react'

const DEFAULT_COLUMNS = [
  { field_name: 'codigo', label: 'Código', column_type: 'text', width: 'sm' },
  { field_name: 'name', label: 'Nome', column_type: 'select', width: 'md' },
  { field_name: 'marca', label: 'Marca', column_type: 'select', width: 'sm' },
  { field_name: 'categoria', label: 'Categoria', column_type: 'select', width: 'sm' },
  { field_name: 'subcategoria', label: 'Sub Categoria', column_type: 'select', width: 'sm' },
  { field_name: 'grupo', label: 'Grupo', column_type: 'select', width: 'sm' },
  { field_name: 'subgrupo', label: 'Sub Grupo', column_type: 'select', width: 'sm' },
  { field_name: 'departamento', label: 'Departamento', column_type: 'select', width: 'sm' },
  { field_name: 'secao', label: 'Seção', column_type: 'select', width: 'sm' },
  { field_name: 'estacao', label: 'Estação', column_type: 'select', width: 'sm' },
  { field_name: 'colecao', label: 'Coleção', column_type: 'select', width: 'sm' },
  { field_name: 'descricao', label: 'Descrição', column_type: 'select', width: 'md' },
  { field_name: 'observacao', label: 'Observação', column_type: 'select', width: 'md' },
  { field_name: 'fabricante', label: 'Fabricante', column_type: 'select', width: 'sm' },
  { field_name: 'fornecedor', label: 'Fornecedor', column_type: 'select', width: 'sm' },
  { field_name: 'ncm', label: 'NCM', column_type: 'text', width: 'sm' },
  { field_name: 'cest', label: 'CEST', column_type: 'text', width: 'sm' },
  { field_name: 'custo', label: 'Custo', column_type: 'currency', width: 'sm' },
  { field_name: 'preco1', label: 'Preço 1', column_type: 'currency', width: 'sm' },
  { field_name: 'preco2', label: 'Preço 2', column_type: 'currency', width: 'sm' },
  { field_name: 'preco3', label: 'Preço 3', column_type: 'currency', width: 'sm' },
  { field_name: 'stock', label: 'Estoque', column_type: 'number', width: 'sm' },
]

const COLUMNS_WITH_OPTIONS = ['name', 'marca', 'categoria', 'subcategoria', 'grupo', 'subgrupo', 'departamento', 'secao', 'estacao', 'colecao', 'descricao', 'observacao', 'fabricante', 'fornecedor']

interface ProductColumn {
  id: string
  field_name: string
  label: string
  is_visible: boolean
  is_editable: boolean
  position: number
  column_type: string
  width: string
  product_column_options?: Array<{ id: string; value: string; position: number }>
}

interface ColumnOption {
  id: string
  column_id: string
  value: string
  position: number
}

export function ProductColumnsSettings() {
  const { selectedStore } = useStore()
  const [columns, setColumns] = useState<ProductColumn[]>([])
  const [columnOptions, setColumnOptions] = useState<Map<string, ColumnOption[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedColumnForOptions, setSelectedColumnForOptions] = useState<ProductColumn | null>(null)
  const [newOptionValue, setNewOptionValue] = useState('')
  const [formData, setFormData] = useState({
    field_name: '',
    label: '',
    is_visible: true,
    is_editable: true,
    column_type: 'text',
    width: 'auto',
  })

  const fetchAllColumnOptions = useCallback(async (cols: ProductColumn[]) => {
    const optionsMap = new Map<string, ColumnOption[]>()

    // Extract column options that are already included in the columns data
    for (const col of cols) {
      if (COLUMNS_WITH_OPTIONS.includes(col.field_name) && col.product_column_options) {
        optionsMap.set(col.id, col.product_column_options)
      }
    }

    setColumnOptions(optionsMap)
  }, [])

  const initializeDefaultColumns = useCallback(async () => {
    if (!selectedStore) return

    try {
      for (let i = 0; i < DEFAULT_COLUMNS.length; i++) {
        const col = DEFAULT_COLUMNS[i]
        await fetch(`/api/stores/${selectedStore.id}/product-columns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...col,
            position: i,
            is_visible: i < 7,
          }),
        })
      }
    } catch (error) {
      console.error('Error initializing default columns:', error)
    }
  }, [selectedStore])

  const fetchColumns = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stores/${selectedStore?.id}/product-columns`)
      const data = await response.json()

      if (data.columns && data.columns.length > 0) {
        setColumns(data.columns)
        await fetchAllColumnOptions(data.columns)
      } else {
        // Initialize with default columns if none exist
        await initializeDefaultColumns()
      }
    } catch (error) {
      console.error('Error fetching columns:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStore, fetchAllColumnOptions, initializeDefaultColumns])

  useEffect(() => {
    if (selectedStore) {
      fetchColumns()
    }
  }, [selectedStore, fetchColumns])

  async function handleSave() {
    if (!selectedStore || !formData.field_name || !formData.label) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? {
            columnId: editingId,
            label: formData.label,
            is_visible: formData.is_visible,
            is_editable: formData.is_editable,
            column_type: formData.column_type,
            width: formData.width,
          }
        : {
            field_name: formData.field_name,
            label: formData.label,
            is_visible: formData.is_visible,
            is_editable: formData.is_editable,
            column_type: formData.column_type,
            width: formData.width,
          }

      const response = await fetch(`/api/stores/${selectedStore.id}/product-columns`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await fetchColumns()
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error) {
      console.error('Error saving column:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!selectedStore || !confirm('Tem certeza que deseja deletar esta coluna?')) return

    try {
      const response = await fetch(`/api/stores/${selectedStore.id}/product-columns?columnId=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchColumns()
      }
    } catch (error) {
      console.error('Error deleting column:', error)
    }
  }

  async function toggleVisibility(column: ProductColumn) {
    if (!selectedStore) return

    try {
      await fetch(`/api/stores/${selectedStore.id}/product-columns`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: column.id,
          label: column.label,
          is_visible: !column.is_visible,
          is_editable: column.is_editable,
          column_type: column.column_type,
          width: column.width,
        }),
      })

      await fetchColumns()
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  async function addOption() {
    if (!selectedStore || !selectedColumnForOptions || !newOptionValue.trim()) return

    try {
      const response = await fetch(`/api/stores/${selectedStore.id}/product-column-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: selectedColumnForOptions.id,
          value: newOptionValue.trim(),
        }),
      })

      if (response.ok) {
        setNewOptionValue('')
        await fetchAllColumnOptions(columns)
      }
    } catch (error) {
      console.error('Error adding option:', error)
    }
  }

  async function deleteOption(optionId: string) {
    if (!selectedStore) return

    try {
      await fetch(`/api/stores/${selectedStore.id}/product-column-options?optionId=${optionId}`, {
        method: 'DELETE',
      })

      await fetchAllColumnOptions(columns)
    } catch (error) {
      console.error('Error deleting option:', error)
    }
  }

  function resetForm() {
    setFormData({
      field_name: '',
      label: '',
      is_visible: true,
      is_editable: true,
      column_type: 'text',
      width: 'auto',
    })
    setEditingId(null)
  }

  function handleEdit(column: ProductColumn) {
    setEditingId(column.id)
    setFormData({
      field_name: column.field_name,
      label: column.label,
      is_visible: column.is_visible,
      is_editable: column.is_editable,
      column_type: column.column_type,
      width: column.width,
    })
    setEditDialogOpen(true)
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>

  const visibleCount = columns.filter(c => c.is_visible).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Colunas de Produto</h3>
          <p className="text-sm text-gray-500">
            {visibleCount} de {columns.length} colunas visíveis
          </p>
        </div>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <IconPlus className="w-4 h-4" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="field_name">Nome do Campo</Label>
                <Input
                  id="field_name"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                  placeholder="ex: marca, categoria"
                  disabled={!!editingId}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deve corresponder a um campo da tabela de produtos
                </p>
              </div>
              <div>
                <Label htmlFor="label">Rótulo da Coluna</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="ex: Marca, Categoria"
                />
              </div>
              <div>
                <Label htmlFor="column_type">Tipo de Campo</Label>
                <select
                  id="column_type"
                  value={formData.column_type}
                  onChange={(e) => setFormData({ ...formData, column_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="currency">Moeda (BRL)</option>
                  <option value="date">Data</option>
                  <option value="textarea">Texto Longo</option>
                  <option value="select">Seleção (com opções)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="width">Largura da Coluna</Label>
                <select
                  id="width"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                >
                  <option value="auto">Automática</option>
                  <option value="sm">Pequena (100px)</option>
                  <option value="md">Média (200px)</option>
                  <option value="lg">Grande (300px)</option>
                  <option value="xl">Muito Grande (400px)</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_visible: !!checked })
                    }
                  />
                  <Label htmlFor="is_visible">Visível</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_editable"
                    checked={formData.is_editable}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_editable: !!checked })
                    }
                  />
                  <Label htmlFor="is_editable">Editável</Label>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingId ? 'Atualizar' : 'Criar'} Coluna
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhuma coluna configurada</div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Rótulo</TableHead>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="w-24">Visível</TableHead>
                <TableHead className="w-24">Editável</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((col) => (
                <TableRow key={col.id}>
                  <TableCell className="text-gray-400">
                    <IconGripVertical className="w-4 h-4" />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{col.field_name}</TableCell>
                  <TableCell>{col.label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {col.column_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleVisibility(col)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {col.is_visible ? (
                        <IconEye className="w-4 h-4 text-green-600" />
                      ) : (
                        <IconEyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    {col.is_editable ? (
                      <Badge variant="secondary" className="text-xs">
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Não
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {COLUMNS_WITH_OPTIONS.includes(col.field_name) && (
                        <Dialog open={optionsDialogOpen && selectedColumnForOptions?.id === col.id} onOpenChange={(open) => {
                          if (open) {
                            setSelectedColumnForOptions(col)
                            setOptionsDialogOpen(true)
                          } else {
                            setOptionsDialogOpen(false)
                          }
                        }}>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedColumnForOptions(col)
                                setOptionsDialogOpen(true)
                              }}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded text-blue-600"
                              title="Gerenciar opções"
                            >
                              <IconList className="w-4 h-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Opções de: {col.label}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Adicionar Opção</Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={newOptionValue}
                                    onChange={(e) => setNewOptionValue(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addOption()
                                      }
                                    }}
                                    placeholder="Digite uma opção"
                                  />
                                  <Button onClick={addOption} variant="outline" className="whitespace-nowrap">
                                    Adicionar
                                  </Button>
                                </div>
                              </div>

                              {columnOptions.get(col.id)?.length ? (
                                <div className="space-y-2">
                                  <Label>Opções Existentes</Label>
                                  <div className="max-h-64 overflow-y-auto space-y-1 border rounded p-2">
                                    {columnOptions.get(col.id)?.map((opt) => (
                                      <div
                                        key={opt.id}
                                        className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm"
                                      >
                                        <span>{opt.value}</span>
                                        <button
                                          onClick={() => deleteOption(opt.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Nenhuma opção configurada</div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      <button
                        onClick={() => handleEdit(col)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Tipos de Campo Disponíveis</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• <strong>Texto</strong> - Campo de texto simples</li>
          <li>• <strong>Número</strong> - Campo numérico (inteiros)</li>
          <li>• <strong>Moeda</strong> - Campo monetário formatado em BRL</li>
          <li>• <strong>Data</strong> - Campo de data</li>
          <li>• <strong>Texto Longo</strong> - Área de texto para conteúdo maior</li>
          <li>• <strong>Seleção</strong> - Dropdown com opções predefinidas (clique no ícone de lista para gerenciar)</li>
        </ul>
      </div>
    </div>
  )
}
