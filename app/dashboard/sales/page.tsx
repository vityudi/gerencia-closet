"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'
import { SalesTable } from '@/components/sales-table'

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

function SalesPageContent() {
  const { selectedStore } = useStore()
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sincroniza store com URL
  useSyncStoreWithUrl()

  const fetchSales = async () => {
    if (!selectedStore) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/stores/${selectedStore.id}/sales`)
      if (!res.ok) {
        throw new Error('Falha ao carregar vendas')
      }
      const text = await res.text()
      if (!text) {
        setSales([])
        return
      }
      const data = JSON.parse(text)
      setSales(data.items || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Error fetching sales:', errorMessage)
      setError(errorMessage)
      setSales([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedStore) {
      setSales([])
      setError(null)
      return
    }

    fetchSales()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore?.id]) // Usar selectedStore.id para detectar mudanças

  if (!selectedStore) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <p className="text-muted-foreground mt-2">Pedidos e relatórios por período.</p>
        <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar as vendas.</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <p className="text-muted-foreground mt-2">Pedidos e relatórios por período.</p>
      </div>

      {isLoading && (
        <div className="mt-4 text-sm text-muted-foreground">Carregando vendas...</div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Erro ao carregar vendas</div>
          <div className="text-xs text-red-600 mt-1">Loja: {selectedStore.name}</div>
          <div className="text-xs text-red-600">Erro: {error}</div>
        </div>
      )}

      {!isLoading && !error && (
        <SalesTable
          data={sales}
          onSaleCreated={fetchSales}
        />
      )}
    </main>
  )
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <p className="text-muted-foreground mt-2">Pedidos e relatórios por período.</p>
        <div className="mt-4 text-sm text-muted-foreground">Carregando...</div>
      </main>
    }>
      <SalesPageContent />
    </Suspense>
  )
}


