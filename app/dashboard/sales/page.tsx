"use client"

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'

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
  }, [selectedStore]) // Usar selectedStore completo para detectar mudanças

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
        <div className="mt-4 space-y-3">
          {sales.length ? sales.map((s) => (
            <div key={s.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-lg">
                    R$ {Number(s.total).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(s.created_at).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Pagamento: {s.payment_method}
                  </div>
                  {s.team_members && (
                    <div className="text-sm text-blue-600 mt-2">
                      👤 Vendedor: {s.team_members.full_name} ({s.team_members.role})
                    </div>
                  )}
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  s.status === 'Concluída' 
                    ? 'bg-green-100 text-green-800' 
                    : s.status === 'Pendente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : s.status === 'Cancelada'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {s.status}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12">
              <div className="text-sm text-muted-foreground">Nenhuma venda encontrada.</div>
              <div className="text-xs text-muted-foreground mt-1">
                Esta loja ainda não possui vendas registradas.
              </div>
            </div>
          )}
        </div>
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


