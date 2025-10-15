"use client"

import { useEffect, useState } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'

type Sale = {
  id: string
  total: number
  created_at: string
  payment_method: string
  status: string
}

export default function SalesPage() {
  const { selectedStore } = useStore()
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sincroniza store com URL
  useSyncStoreWithUrl()

  useEffect(() => {
    if (!selectedStore) {
      setSales([])
      setError(null)
      return
    }

    const fetchSales = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/stores/${selectedStore.id}/sales`)
        if (!res.ok) {
          throw new Error('Falha ao carregar vendas')
        }
        const data = await res.json()
        setSales(data.items || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setSales([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSales()
  }, [selectedStore?.id]) // Usar apenas o ID para evitar re-renders desnecessários

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
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <p className="text-muted-foreground mt-2">Pedidos e relatórios por período.</p>
      
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
        <div className="mt-4 space-y-2">
          {sales.length ? sales.map((s) => (
            <div key={s.id} className="rounded border p-3">
              <div className="font-medium">
                Total: R$ {Number(s.total).toFixed(2)} • {new Date(s.created_at).toLocaleString('pt-BR')}
              </div>
              <div className="text-sm text-muted-foreground">
                Pagamento: {s.payment_method} • Status: {s.status}
              </div>
            </div>
          )) : (
            <div className="text-sm text-muted-foreground">Nenhuma venda encontrada.</div>
          )}
        </div>
      )}
    </main>
  )
}


