'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useStore } from '@/contexts/store-context'
import { Product } from './products-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconTrash, IconPlus, IconX, IconChevronDown, IconChevronRight } from '@tabler/icons-react'

interface ProductAttribute {
  id: string
  name: string
  label: string
  is_variation: boolean
  is_required: boolean
  product_attribute_options?: { value: string }[]
}

interface ProductColumn {
  id: string
  field_name: string
  label: string
  column_type: string
  product_column_options?: Array<{ value: string }>
}

interface ProductEditDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => Promise<void>
  onDelete: (productId: string) => Promise<void>
}

// Fields that have dropdown options
const FIELDS_WITH_OPTIONS = [
  'name',
  'marca',
  'categoria',
  'subcategoria',
  'grupo',
  'subgrupo',
  'departamento',
  'secao',
  'estacao',
  'colecao',
  'descricao',
  'observacao',
  'fabricante',
  'fornecedor',
]

// Represents a variation value with its sub-variations
interface VariationValueWithSubVariations {
  value: string
  subVariations: Record<string, string[]> // { attributeId: [selected values] }
}

// Represents a variation step with selected values
interface VariationStep {
  attributeId: string
  label: string
  selectedValues: VariationValueWithSubVariations[]
  isPrimary: boolean // true for first variation, false for secondary
}

// Represents a final combination with quantity
interface VariationCombination {
  combination: string
  stock: number
}

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
  const [columnConfigs, setColumnConfigs] = useState<Map<string, ProductColumn>>(
    new Map()
  )
  const [columnOptions, setColumnOptions] = useState<
    Map<string, Array<{ value: string }>>
  >(new Map())
  const [loading, setLoading] = useState(false)

  // New variations state - for CREATE mode only
  const [variationSteps, setVariationSteps] = useState<VariationStep[]>([])
  const [variationSelectDialogOpen, setVariationSelectDialogOpen] = useState(false)
  const [selectedAttrIdForAdd, setSelectedAttrIdForAdd] = useState<string>('')
  const [isPrimaryVariation, setIsPrimaryVariation] = useState(true)
  const [variationCombinations, setVariationCombinations] = useState<VariationCombination[]>([])
  const [expandedValues, setExpandedValues] = useState<Set<string>>(new Set())

  // Fetch all product data in a single request
  const fetchProductData = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${selectedStore?.id}/product-data`)
      const data = await response.json()

      setAttributes(data.attributes || [])

      // Build column configs and options maps
      if (data.columns) {
        const configMap = new Map<string, ProductColumn>()
        const optionsMap = new Map<string, Array<{ value: string }>>()

        for (const col of data.columns) {
          if (FIELDS_WITH_OPTIONS.includes(col.field_name)) {
            configMap.set(col.field_name, col)
            if (col.product_column_options) {
              optionsMap.set(col.id, col.product_column_options)
            }
          }
        }

        setColumnConfigs(configMap)
        setColumnOptions(optionsMap)
      }
    } catch (error) {
      console.error('Error fetching product data:', error)
    }
  }, [selectedStore])

  useEffect(() => {
    if (product) {
      setFormData({ ...product })
    } else {
      setFormData({})
      setVariationSteps([])
      setVariationCombinations([])
    }

    if (selectedStore && open) {
      fetchProductData()
    }
  }, [product, open, selectedStore, fetchProductData])

  // Compute variation filters using useMemo to prevent recreations
  const { primaryVariations, secondaryVariations } = useMemo(() => {
    return {
      primaryVariations: variationSteps.filter((v) => v.isPrimary),
      secondaryVariations: variationSteps.filter((v) => !v.isPrimary),
    }
  }, [variationSteps])

  // Generate all combinations from variation steps with custom sub-variations
  useEffect(() => {
    if (primaryVariations.length === 0) {
      setVariationCombinations([])
      return
    }

    const combinations: VariationCombination[] = []

    // If only primary variations
    if (secondaryVariations.length === 0) {
      primaryVariations.forEach((step) => {
        step.selectedValues.forEach((valueObj) => {
          const comboStr = `${step.label}: ${valueObj.value}`
          combinations.push({
            combination: comboStr,
            stock: 0,
          })
        })
      })
    } else {
      // If both primary and secondary variations
      const primaryStep = primaryVariations[0]
      const secondaryStep = secondaryVariations[0]

      primaryStep.selectedValues.forEach((primaryValueObj) => {
        const subVars = primaryValueObj.subVariations[secondaryStep.attributeId] || []

        if (subVars.length > 0) {
          // Use custom sub-variations for this primary value
          subVars.forEach((subVar) => {
            const comboStr = `${primaryStep.label}: ${primaryValueObj.value} | ${secondaryStep.label}: ${subVar}`
            combinations.push({
              combination: comboStr,
              stock: 0,
            })
          })
        }
      })
    }

    setVariationCombinations(combinations)
  }, [primaryVariations, secondaryVariations])

  async function handleSave() {
    if (!selectedStore || !formData.codigo || !formData.name) {
      alert('Código e Nome são obrigatórios')
      return
    }

    try {
      setLoading(true)

      // EDIT MODE: Just update the product
      if (product) {
        const dataToSave = {
          ...formData,
          productId: product.id,
        }

        const response = await fetch(`/api/stores/${selectedStore.id}/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || 'Error saving product'
          throw new Error(errorMessage)
        }

        const savedProduct = await response.json()
        await onSave(savedProduct)
        onOpenChange(false)
        return
      }

      // CREATE MODE: Create with variations if any
      if (variationSteps.length > 0 && variationCombinations.length === 0) {
        alert('Nenhuma combinação de variação foi gerada')
        return
      }

      if (variationCombinations.some((c) => c.stock === 0)) {
        alert('Por favor, defina a quantidade para todas as combinações')
        return
      }

      // Transform combinations back to variation format for the API
      const variationGroupsWithStock =
        primaryVariations.length > 0
          ? variationSteps.map((step) => ({
              attributeId: step.attributeId,
              values: variationCombinations
                .map((combo) => {
                  // Extract the value for this attribute from the combination
                  const lines = combo.combination.split(' | ')
                  const relevantLine = lines.find((line) =>
                    line.startsWith(step.label + ':')
                  )
                  if (!relevantLine) return null

                  const value = relevantLine.split(': ')[1]
                  return {
                    value,
                    stock: combo.stock,
                  }
                })
                .filter((item) => item !== null)
                .filter(
                  (item, index, self) =>
                    item && self.findIndex((t) => t?.value === item.value) === index
                ) as Array<{ value: string; stock: number }>,
            }))
          : undefined

      const dataToSave = {
        ...formData,
        variationGroups: variationGroupsWithStock,
      }

      const response = await fetch(`/api/stores/${selectedStore.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Error saving product'
        throw new Error(errorMessage)
      }

      const savedProducts = await response.json()

      // Notify parent with all products
      if (Array.isArray(savedProducts)) {
        for (const prod of savedProducts) {
          await onSave(prod)
        }
      } else {
        await onSave(savedProducts)
      }

      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar produto'
      console.error('Error saving product:', error)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!selectedStore || !product || !confirm('Tem certeza que deseja deletar este produto?'))
      return

    try {
      await onDelete(product.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erro ao deletar produto')
    }
  }

  function openVariationSelectDialog(primary: boolean) {
    const variationAttrs = attributes.filter((a) => a.is_variation)
    if (variationAttrs.length === 0) {
      alert('Nenhum atributo de variação configurado')
      return
    }

    // Filter out already selected variations
    const availableAttrs = variationAttrs.filter(
      (attr) => !variationSteps.find((v) => v.attributeId === attr.id)
    )

    if (availableAttrs.length === 0) {
      alert('Todas as variações disponíveis já foram adicionadas')
      return
    }

    setIsPrimaryVariation(primary)
    setSelectedAttrIdForAdd(availableAttrs[0].id)
    setVariationSelectDialogOpen(true)
  }

  function confirmAddVariation() {
    if (!selectedAttrIdForAdd) return

    const attr = attributes.find((a) => a.id === selectedAttrIdForAdd)
    if (!attr) return

    setVariationSteps([
      ...variationSteps,
      {
        attributeId: selectedAttrIdForAdd,
        label: attr.label,
        selectedValues: [],
        isPrimary: isPrimaryVariation,
      },
    ])

    setVariationSelectDialogOpen(false)
    setSelectedAttrIdForAdd('')
  }

  function removeVariationStep(attributeId: string) {
    setVariationSteps(variationSteps.filter((v) => v.attributeId !== attributeId))
  }

  function toggleVariationValue(stepIndex: number, value: string) {
    setVariationSteps(
      variationSteps.map((step, idx) => {
        if (idx === stepIndex) {
          const exists = step.selectedValues.find((v) => v.value === value)
          if (exists) {
            return {
              ...step,
              selectedValues: step.selectedValues.filter((v) => v.value !== value),
            }
          } else {
            return {
              ...step,
              selectedValues: [
                ...step.selectedValues,
                {
                  value,
                  subVariations: {},
                },
              ],
            }
          }
        }
        return step
      })
    )
  }

  function toggleSubVariationValue(
    stepIndex: number,
    parentValue: string,
    nextStepAttrId: string,
    subValue: string
  ) {
    setVariationSteps(
      variationSteps.map((step, idx) => {
        if (idx === stepIndex) {
          return {
            ...step,
            selectedValues: step.selectedValues.map((val) => {
              if (val.value === parentValue) {
                const subVars = val.subVariations[nextStepAttrId] || []
                const exists = subVars.includes(subValue)
                return {
                  ...val,
                  subVariations: {
                    ...val.subVariations,
                    [nextStepAttrId]: exists
                      ? subVars.filter((v) => v !== subValue)
                      : [...subVars, subValue],
                  },
                }
              }
              return val
            }),
          }
        }
        return step
      })
    )
  }

  function toggleExpanded(key: string) {
    const newExpanded = new Set(expandedValues)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedValues(newExpanded)
  }

  function updateCombinationStock(comboIndex: number, stock: number) {
    setVariationCombinations(
      variationCombinations.map((combo, idx) =>
        idx === comboIndex ? { ...combo, stock } : combo
      )
    )
  }

  function renderField(fieldName: string, fieldLabel: string) {
    const fieldValue = String((formData as Record<string, unknown>)[fieldName] || '')
    const colConfig = columnConfigs.get(fieldName)
    const colId = colConfig?.id

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
              <option key={opt.value} value={opt.value}>
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
  const isEditMode = !!product

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="preco">Preço & Estoque</TabsTrigger>
            {!isEditMode && <TabsTrigger value="variacoes">Variações</TabsTrigger>}
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

            {/* Stock field - only shown in EDIT mode or when no variations in CREATE mode */}
            {isEditMode || variationSteps.length === 0 ? (
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm text-blue-800 dark:text-blue-200">
                O estoque será definido para cada combinação de variação abaixo
              </div>
            )}
          </TabsContent>

          {/* Variations tab - only in CREATE mode */}
          {!isEditMode && (
            <TabsContent value="variacoes" className="space-y-4 mt-4">
              {variationAttributes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum atributo de variação configurado. Configure em Configurações &gt; Produtos.
                </div>
              ) : (
                <>
                  {/* Primary Variations */}
                  {primaryVariations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">Variações Principais</h4>
                      {primaryVariations.map((step, stepIndex) => {
                        const attr = attributes.find((a) => a.id === step.attributeId)
                        const options = attr?.product_attribute_options || []
                        const hasSecondary = secondaryVariations.length > 0

                        return (
                          <div key={step.attributeId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">{step.label}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariationStep(step.attributeId)}
                              >
                                <IconX className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Checkbox list for variation values */}
                            <div className="space-y-2">
                              {options.map((option) => {
                                const expandKey = `${step.attributeId}-${option.value}`
                                const isExpanded = expandedValues.has(expandKey)
                                const valueObj = step.selectedValues.find(
                                  (v) => v.value === option.value
                                )
                                const isSelected = !!valueObj

                                return (
                                  <div key={option.value} className="space-y-2">
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                      <input
                                        type="checkbox"
                                        id={`${step.attributeId}-${option.value}`}
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleVariationValue(stepIndex, option.value)
                                        }
                                        className="rounded"
                                      />
                                      <label
                                        htmlFor={`${step.attributeId}-${option.value}`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        {option.value}
                                      </label>

                                      {/* Expand button for sub-variations */}
                                      {isSelected && hasSecondary && (
                                        <button
                                          onClick={() => toggleExpanded(expandKey)}
                                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                        >
                                          {isExpanded ? (
                                            <IconChevronDown className="w-4 h-4" />
                                          ) : (
                                            <IconChevronRight className="w-4 h-4" />
                                          )}
                                        </button>
                                      )}
                                    </div>

                                    {/* Sub-variations for this value */}
                                    {isSelected && hasSecondary && isExpanded && (
                                      <div className="ml-6 space-y-3">
                                        {secondaryVariations.map((secondaryStep) => {
                                          const secondaryAttr = attributes.find(
                                            (a) => a.id === secondaryStep.attributeId
                                          )
                                          const secondaryOptions =
                                            secondaryAttr?.product_attribute_options || []

                                          return (
                                            <div
                                              key={secondaryStep.attributeId}
                                              className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800"
                                            >
                                              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                                {secondaryStep.label} para {option.value}:
                                              </p>
                                              <div className="space-y-1">
                                                {secondaryOptions.map((subOpt) => (
                                                  <div
                                                    key={subOpt.value}
                                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      id={`${expandKey}-${subOpt.value}`}
                                                      checked={
                                                        valueObj?.subVariations[
                                                          secondaryStep.attributeId
                                                        ]?.includes(subOpt.value) || false
                                                      }
                                                      onChange={() =>
                                                        toggleSubVariationValue(
                                                          stepIndex,
                                                          option.value,
                                                          secondaryStep.attributeId,
                                                          subOpt.value
                                                        )
                                                      }
                                                      className="rounded"
                                                    />
                                                    <label
                                                      htmlFor={`${expandKey}-${subOpt.value}`}
                                                      className="text-sm cursor-pointer flex-1"
                                                    >
                                                      {subOpt.value}
                                                    </label>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Secondary Variations */}
                  {secondaryVariations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-base">Variações Secundárias</h4>
                      {secondaryVariations.map((step) => {
                        const attr = attributes.find((a) => a.id === step.attributeId)

                        return (
                          <div key={step.attributeId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">{step.label}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariationStep(step.attributeId)}
                              >
                                <IconX className="w-4 h-4" />
                              </Button>
                            </div>

                            <p className="text-sm text-gray-500">
                              Configure as seleções secundárias ao expandir cada variação principal acima
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add Variation Buttons */}
                  <div className="space-y-2">
                    {primaryVariations.length === 0 && (
                      <Dialog open={variationSelectDialogOpen && isPrimaryVariation} onOpenChange={(open) => {
                        if (!open) setVariationSelectDialogOpen(false)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => openVariationSelectDialog(true)}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <IconPlus className="w-4 h-4" />
                            Adicionar Variação Principal
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Variação Principal</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="variation-select">Selecione a Variação</Label>
                              <select
                                id="variation-select"
                                value={selectedAttrIdForAdd}
                                onChange={(e) => setSelectedAttrIdForAdd(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 mt-2"
                              >
                                <option value="">Escolha uma variação</option>
                                {attributes
                                  .filter((a) => a.is_variation)
                                  .filter((attr) => !variationSteps.find((v) => v.attributeId === attr.id))
                                  .map((attr) => (
                                    <option key={attr.id} value={attr.id}>
                                      {attr.label}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setVariationSelectDialogOpen(false)
                                  setSelectedAttrIdForAdd('')
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={confirmAddVariation} disabled={!selectedAttrIdForAdd}>
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {primaryVariations.length > 0 && secondaryVariations.length === 0 && (
                      <Dialog open={variationSelectDialogOpen && !isPrimaryVariation} onOpenChange={(open) => {
                        if (!open) setVariationSelectDialogOpen(false)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => openVariationSelectDialog(false)}
                            variant="outline"
                            className="w-full gap-2"
                          >
                            <IconPlus className="w-4 h-4" />
                            Adicionar Variação Secundária
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Adicionar Variação Secundária</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="variation-select-secondary">Selecione a Variação</Label>
                              <select
                                id="variation-select-secondary"
                                value={selectedAttrIdForAdd}
                                onChange={(e) => setSelectedAttrIdForAdd(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 mt-2"
                              >
                                <option value="">Escolha uma variação</option>
                                {attributes
                                  .filter((a) => a.is_variation)
                                  .filter((attr) => !variationSteps.find((v) => v.attributeId === attr.id))
                                  .map((attr) => (
                                    <option key={attr.id} value={attr.id}>
                                      {attr.label}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setVariationSelectDialogOpen(false)
                                  setSelectedAttrIdForAdd('')
                                }}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={confirmAddVariation} disabled={!selectedAttrIdForAdd}>
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Real-time preview of combinations */}
                  {variationCombinations.length > 0 && (
                    <div className="space-y-2 border-t pt-4">
                      <h4 className="font-semibold">
                        Prévia de Combinações ({variationCombinations.length})
                      </h4>
                      <p className="text-sm text-gray-500">
                        Total de produtos a criar: <strong>{variationCombinations.length}</strong>
                      </p>
                      <div className="max-h-64 overflow-y-auto space-y-3">
                        {variationCombinations.map((combo, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium">{combo.combination}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`stock-${idx}`} className="text-xs text-gray-600 dark:text-gray-400">
                                Qtd:
                              </Label>
                              <Input
                                id={`stock-${idx}`}
                                type="number"
                                min="0"
                                className="w-24"
                                value={combo.stock}
                                onChange={(e) =>
                                  updateCombinationStock(idx, parseInt(e.target.value) || 0)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )}
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
