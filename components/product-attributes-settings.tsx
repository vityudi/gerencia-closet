'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/contexts/store-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react'

interface ProductAttribute {
  id: string
  name: string
  label: string
  is_variation: boolean
  is_required: boolean
  position: number
  product_attribute_options?: { value: string; position: number }[]
}

export function ProductAttributesSettings() {
  const { selectedStore } = useStore()
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    is_variation: false,
    is_required: false,
    options: [] as string[],
  })
  const [newOption, setNewOption] = useState('')

  useEffect(() => {
    if (selectedStore) {
      fetchAttributes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore])

  async function fetchAttributes() {
    try {
      setLoading(true)
      // Use the optimized product-data endpoint which already includes attributes with options
      const response = await fetch(`/api/stores/${selectedStore?.id}/product-data`)
      const data = await response.json()
      setAttributes(data.attributes || [])
    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!selectedStore || !formData.name || !formData.label) return

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? {
            attributeId: editingId,
            name: formData.name,
            label: formData.label,
            is_variation: formData.is_variation,
            is_required: formData.is_required,
          }
        : {
            name: formData.name,
            label: formData.label,
            is_variation: formData.is_variation,
            is_required: formData.is_required,
            options: formData.options,
          }

      const response = await fetch(`/api/stores/${selectedStore.id}/product-attributes`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        await fetchAttributes()
        resetForm()
        setIsOpen(false)
      }
    } catch (error) {
      console.error('Error saving attribute:', error)
    }
  }

  async function handleDelete(id: string) {
    if (!selectedStore || !confirm('Tem certeza que deseja deletar este atributo?')) return

    try {
      const response = await fetch(`/api/stores/${selectedStore.id}/product-attributes?attributeId=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAttributes()
      }
    } catch (error) {
      console.error('Error deleting attribute:', error)
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      label: '',
      is_variation: false,
      is_required: false,
      options: [],
    })
    setNewOption('')
    setEditingId(null)
  }

  function handleEdit(attribute: ProductAttribute) {
    setEditingId(attribute.id)
    setFormData({
      name: attribute.name,
      label: attribute.label,
      is_variation: attribute.is_variation,
      is_required: attribute.is_required,
      options: attribute.product_attribute_options?.map((o) => o.value) || [],
    })
    setIsOpen(true)
  }

  function addOption() {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()],
      })
      setNewOption('')
    }
  }

  function removeOption(index: number) {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    })
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Atributos de Produto</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <IconPlus className="w-4 h-4" />
              Novo Atributo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Atributo' : 'Novo Atributo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Atributo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: tamanho, cor"
                  disabled={!!editingId}
                />
              </div>
              <div>
                <Label>Rótulo</Label>
                <Input
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="ex: Tamanho, Cor"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_variation"
                    checked={formData.is_variation}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_variation: !!checked })
                    }
                  />
                  <Label htmlFor="is_variation">É uma variação?</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_required"
                    checked={formData.is_required}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_required: !!checked })
                    }
                  />
                  <Label htmlFor="is_required">Obrigatório?</Label>
                </div>
              </div>

              {formData.is_variation && (
                <div className="space-y-2">
                  <Label>Opções de Variação</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
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
                  {formData.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.options.map((option, index) => (
                        <div
                          key={index}
                          className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm flex items-center gap-2"
                        >
                          {option}
                          <button
                            onClick={() => removeOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleSave} className="w-full">
                {editingId ? 'Atualizar' : 'Criar'} Atributo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {attributes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Nenhum atributo configurado</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Rótulo</TableHead>
              <TableHead className="w-20">Variação</TableHead>
              <TableHead className="w-20">Obrigatório</TableHead>
              <TableHead className="w-20">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.map((attr) => (
              <TableRow key={attr.id}>
                <TableCell className="font-mono text-sm">{attr.name}</TableCell>
                <TableCell>{attr.label}</TableCell>
                <TableCell>{attr.is_variation ? '✓' : '-'}</TableCell>
                <TableCell>{attr.is_required ? '✓' : '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(attr)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attr.id)}
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
      )}
    </div>
  )
}
