"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'
import { ProductsTableDynamic, type Product } from '@/components/products-table-dynamic'
import { ProductEditDialog } from '@/components/product-edit-dialog'
import { Button } from '@/components/ui/button'
import { IconPlus } from '@tabler/icons-react'

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

function ProductsPageContent() {
  const { selectedStore } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [columnConfig, setColumnConfig] = useState<ProductColumn[]>([])

  // Sincroniza store com URL
  useSyncStoreWithUrl()

  useEffect(() => {
    if (!selectedStore) {
      setProducts([])
      setColumnConfig([])
      setError(null)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch column configuration
        const colRes = await fetch(`/api/stores/${selectedStore.id}/product-columns`)
        if (colRes.ok) {
          const colData = await colRes.json()
          setColumnConfig(colData.columns || [])
        }

        // Fetch products
        const res = await fetch(`/api/stores/${selectedStore.id}/products`)
        if (!res.ok) {
          throw new Error('Falha ao carregar produtos')
        }
        const data = await res.json()
        setProducts(data.items || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedStore]) // Usar selectedStore completo para detectar mudanças

  async function handleSave() {
    if (!selectedStore) return

    try {
      const res = await fetch(`/api/stores/${selectedStore.id}/products`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.items || [])
      }
    } catch (error) {
      console.error('Error refreshing products:', error)
    }
  }

  async function handleDelete(productId: string) {
    if (!selectedStore) return

    try {
      const res = await fetch(`/api/stores/${selectedStore.id}/products?productId=${productId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId))
      } else {
        alert('Erro ao deletar produto')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erro ao deletar produto')
    }
  }

  function openNewProductDialog() {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  function openEditProductDialog(product: Product) {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  if (!selectedStore) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <p className="text-muted-foreground mt-2">Catálogo de produtos por loja.</p>
        <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar os produtos.</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground mt-2">Catálogo de produtos por loja.</p>
        </div>
        <Button onClick={openNewProductDialog} className="gap-2">
          <IconPlus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {isLoading && (
        <div className="mt-4 text-sm text-muted-foreground">Carregando produtos...</div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Erro ao carregar produtos</div>
          <div className="text-xs text-red-600 mt-1">Loja: {selectedStore.name}</div>
          <div className="text-xs text-red-600">Erro: {error}</div>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <ProductsTableDynamic
            data={products}
            onEdit={openEditProductDialog}
            columnConfig={columnConfig}
          />
          <ProductEditDialog
            product={editingProduct}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </>
      )}
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <p className="text-muted-foreground mt-2">Catálogo de produtos por loja.</p>
        <div className="mt-4 text-sm text-muted-foreground">Carregando...</div>
      </main>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}


