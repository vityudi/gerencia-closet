"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'
import { ProductsTable } from '@/components/products-table'

type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  created_at?: string
}

function ProductsPageContent() {
  const { selectedStore } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sincroniza store com URL
  useSyncStoreWithUrl()

  useEffect(() => {
    if (!selectedStore) {
      setProducts([])
      setError(null)
      return
    }

    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
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

    fetchProducts()
  }, [selectedStore]) // Usar selectedStore completo para detectar mudanças

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <p className="text-muted-foreground mt-2">Catálogo de produtos por loja.</p>
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
        <ProductsTable data={products} />
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


