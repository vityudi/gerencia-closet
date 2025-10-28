'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStore } from '@/contexts/store-context'
import { Product } from './products-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconTrash, IconPlus } from '@tabler/icons-react'

interface ProductAttribute {
  id: string
  name: string
  label: string
  is_variation: boolean
  is_required: boolean
  product_attribute_options?: { value: string }[]
}

interface ColumnOption {
  id: string
  column_id: string
  value: string
  position: number
}

interface ColumnConfig {
  id: string
  field_name: string
  label: string
  column_type: string
}

interface ProductEditDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => Promise<void>
  onDelete: (productId: string) => Promise<void>
}

const FIELDS_WITH_OPTIONS = ['name', 'marca', 'categoria', 'subcategoria', 'grupo', 'subgrupo', 'departamento', 'secao', 'estacao', 'colecao', 'descricao', 'observacao', 'fabricante', 'fornecedor']

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: ProductEditDialogProps) {
  const { selectedStore } = useStore()
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  const [variations, setVariations] = useState<{ [key: string]: string }>({})
  const [newVariationAttrId, setNewVariationAttrId] = useState<string>('')
  const [newVariationValue, setNewVariationValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [columnConfigs, setColumnConfigs] = useState<Map<string, ColumnConfig>>(new Map())
  const [columnOptions, setColumnOptions] = useState<Map<string, ColumnOption[]>>(new Map())

  const fetchAttributes = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${selectedStore?.id}/product-attributes`)
      const data = await response.json()
      setAttributes(data.attributes || [])
    } catch (error) {
      console.error('Error fetching attributes:', error)
    }
  }, [selectedStore])

  const fetchColumnConfigs = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${selectedStore?.id}/product-columns`)
      const data = await response.json()

      if (data.columns) {
        const configMap = new Map<string, ColumnConfig>()
        const optionsMap = new Map<string, ColumnOption[]>()

        for (const col of data.columns) {
          if (FIELDS_WITH_OPTIONS.includes(col.field_name)) {
            configMap.set(col.field_name, col)

            // Fetch options for this column
            try {
              const optRes = await fetch(
                `/api/stores/${selectedStore?.id}/product-column-options?columnId=${col.id}`
              )
              const optData = await optRes.json()
              optionsMap.set(col.id, optData.options || [])
            } catch (error) {
              console.error(`Error fetching options for ${col.field_name}:`, error)
            }
          }
        }

        setColumnConfigs(configMap)
        setColumnOptions(optionsMap)
      }
    } catch (error) {
      console.error('Error fetching column configs:', error)
    }
  }, [selectedStore])

  useEffect(() => {
    if (product) {
      setFormData({ ...product })
      const vars: { [key: string]: string } = {}
      product.product_variations?.forEach((v) => {
        vars[v.attribute_id] = v.value
      })
      setVariations(vars)
    } else {
      setFormData({})
      setVariations({})
    }

    if (selectedStore && open) {
      fetchAttributes()
      fetchColumnConfigs()
    }
  }, [product, open, selectedStore, fetchAttributes, fetchColumnConfigs])

  async function handleSave() {
    if (!selectedStore || !formData.codigo || !formData.name) {
      alert('Código e Nome são obrigatórios')
      return
    }

    try {
      setLoading(true)
      const dataToSave = {
        ...formData,
        productId: product?.id,
      }

      const response = await fetch(`/api/stores/${selectedStore.id}/products`, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        throw new Error('Error saving product')
      }

      const savedProduct = await response.json()

      // Save variations
      for (const [attrId, value] of Object.entries(variations)) {
        if (value) {
          const existingVar = product?.product_variations?.find((v) => v.attribute_id === attrId)
          if (!existingVar && product) {
            // Add new variation
            await fetch(`/api/stores/${selectedStore.id}/product-variations`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                attributeId: attrId,
                value,
              }),
            })
          }
        }
      }

      await onSave(savedProduct)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Erro ao salvar produto')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedStore || !product || !confirm('Tem certeza que deseja deletar este produto?')) return

    try {
      await onDelete(product.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erro ao deletar produto')
    }
  }

  async function addVariation() {
    if (!selectedStore || !product || !newVariationAttrId || !newVariationValue) return

    try {
      await fetch(`/api/stores/${selectedStore.id}/product-variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          attributeId: newVariationAttrId,
          value: newVariationValue,
        }),
      })

      setVariations({
        ...variations,
        [newVariationAttrId]: newVariationValue,
      })
      setNewVariationAttrId('')
      setNewVariationValue('')
    } catch (error) {
      console.error('Error adding variation:', error)
    }
  }

  function renderField(fieldName: string, fieldLabel: string) {
    const fieldValue = String((formData as Record<string, unknown>)[fieldName] || '')
    const colConfig = columnConfigs.get(fieldName)
    const colId = colConfig?.id

    // Check if field has options
    const options = colId ? columnOptions.get(colId) : undefined

    if (options && options.length > 0) {
      return (
        <div key={fieldName}>
          <Label htmlFor={fieldName}>{fieldLabel}</Label>
          <select
            id={fieldName}
            value={fieldValue}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
          >
            <option value="">Selecione {fieldLabel}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.value}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (colConfig?.column_type === 'textarea') {
      return (
        <div key={fieldName}>
          <Label htmlFor={fieldName}>{fieldLabel}</Label>
          <textarea
            id={fieldName}
            value={fieldValue}
            onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
            placeholder={`Digite ${fieldLabel.toLowerCase()}`}
            className="w-full min-h-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
          />
        </div>
      )
    }

    return (
      <div key={fieldName}>
        <Label htmlFor={fieldName}>{fieldLabel}</Label>
        <Input
          id={fieldName}
          value={fieldValue}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
          placeholder={`Ex: ${fieldLabel}`}
        />
      </div>
    )
  }

  const variationAttributes = attributes.filter((a) => a.is_variation)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="preco">Preço & Estoque</TabsTrigger>
            <TabsTrigger value="variacoes">Variações</TabsTrigger>
          </TabsList>

          <TabsContent value="basico" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ''}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: PROD-001"
                  disabled={!!product}
                />
              </div>
              {renderField('name', 'Nome *')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField('marca', 'Marca')}
              {renderField('fabricante', 'Fabricante')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField('categoria', 'Categoria')}
              {renderField('subcategoria', 'Sub Categoria')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField('grupo', 'Grupo')}
              {renderField('subgrupo', 'Sub Grupo')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField('departamento', 'Departamento')}
              {renderField('secao', 'Seção')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderField('estacao', 'Estação')}
              {renderField('colecao', 'Coleção')}
            </div>

            {renderField('descricao', 'Descrição')}
            {renderField('observacao', 'Observação')}

            <div className="grid grid-cols-2 gap-4">
              {renderField('fornecedor', 'Fornecedor')}
              <div>
                <Label htmlFor="ncm">NCM</Label>
                <Input
                  id="ncm"
                  value={formData.ncm || ''}
                  onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                  placeholder="Ex: 6204620000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cest">CEST</Label>
              <Input
                id="cest"
                value={formData.cest || ''}
                onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                placeholder="Ex: 0500800"
              />
            </div>
          </TabsContent>

          <TabsContent value="preco" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custo">Custo (BRL)</Label>
                <Input
                  id="custo"
                  type="number"
                  step="0.01"
                  value={formData.custo || ''}
                  onChange={(e) => setFormData({ ...formData, custo: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="preco1">Preço 1 (BRL) *</Label>
                <Input
                  id="preco1"
                  type="number"
                  step="0.01"
                  value={formData.preco1 || ''}
                  onChange={(e) => setFormData({ ...formData, preco1: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preco2">Preço 2 (BRL)</Label>
                <Input
                  id="preco2"
                  type="number"
                  step="0.01"
                  value={formData.preco2 || ''}
                  onChange={(e) => setFormData({ ...formData, preco2: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="preco3">Preço 3 (BRL)</Label>
                <Input
                  id="preco3"
                  type="number"
                  step="0.01"
                  value={formData.preco3 || ''}
                  onChange={(e) => setFormData({ ...formData, preco3: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </TabsContent>

          <TabsContent value="variacoes" className="space-y-4 mt-4">
            {variationAttributes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum atributo de variação configurado. Configure em Configurações &gt; Produtos.
              </div>
            ) : (
              <>
                {variations && Object.keys(variations).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Variações Atuais</h4>
                    <div className="space-y-2">
                      {Object.entries(variations).map(([attrId, value]) => {
                        const attr = attributes.find((a) => a.id === attrId)
                        return (
                          <div key={attrId} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            <span className="text-sm">
                              <strong>{attr?.label}:</strong> {value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Adicionar Variação</h4>
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="var-attr">Atributo</Label>
                      <select
                        id="var-attr"
                        value={newVariationAttrId}
                        onChange={(e) => setNewVariationAttrId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                      >
                        <option value="">Selecione um atributo</option>
                        {variationAttributes.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="var-value">Valor</Label>
                      {newVariationAttrId &&
                        attributes.find((a) => a.id === newVariationAttrId)?.product_attribute_options
                          ?.length ? (
                        <select
                          id="var-value"
                          value={newVariationValue}
                          onChange={(e) => setNewVariationValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                        >
                          <option value="">Selecione um valor</option>
                          {attributes
                            .find((a) => a.id === newVariationAttrId)
                            ?.product_attribute_options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.value}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <Input
                          id="var-value"
                          value={newVariationValue}
                          onChange={(e) => setNewVariationValue(e.target.value)}
                          placeholder="Digite o valor"
                        />
                      )}
                    </div>
                    <Button
                      onClick={addVariation}
                      className="w-full gap-2"
                      disabled={!newVariationAttrId || !newVariationValue || !product}
                    >
                      <IconPlus className="w-4 h-4" />
                      Adicionar Variação
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
          {product && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="mr-auto"
            >
              <IconTrash className="w-4 h-4 mr-2" />
              Deletar
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
