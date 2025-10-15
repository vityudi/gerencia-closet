"use client"

import { useEffect, useState, Suspense } from 'react'
import { useStore } from '@/contexts/store-context'
import { useSyncStoreWithUrl } from '@/hooks/use-store'

type Customer = {
  id: string
  full_name: string
  email?: string
  phone?: string
}

function CustomersPageContent() {
  const { selectedStore } = useStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sincroniza store com URL
  useSyncStoreWithUrl()

  useEffect(() => {
    if (!selectedStore) {
      setCustomers([])
      setError(null)
      return
    }

    const fetchCustomers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const res = await fetch(`/api/stores/${selectedStore.id}/customers`)
        if (!res.ok) {
          throw new Error('Falha ao carregar clientes')
        }
        const data = await res.json()
        setCustomers(data.items || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        setCustomers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [selectedStore]) // Usar selectedStore completo para detectar mudanças

  if (!selectedStore) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-muted-foreground mt-2">Lista e gestão de clientes.</p>
        <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar os clientes.</div>
      </main>
    )
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <p className="text-muted-foreground mt-2">Lista e gestão de clientes.</p>
      
      {isLoading && (
        <div className="mt-4 text-sm text-muted-foreground">Carregando clientes...</div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Erro ao carregar clientes</div>
          <div className="text-xs text-red-600 mt-1">Loja: {selectedStore.name}</div>
          <div className="text-xs text-red-600">Erro: {error}</div>
        </div>
      )}
      
      {!isLoading && !error && (
        <div className="mt-4 space-y-2">
          {customers.length ? customers.map((c) => (
            <div key={c.id} className="rounded border p-3">
              <div className="font-medium">{c.full_name}</div>
              <div className="text-sm text-muted-foreground">{c.email ?? '—'} • {c.phone ?? '—'}</div>
            </div>
          )) : (
            <div className="text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
          )}
        </div>
      )}
    </main>
  )
}

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-muted-foreground mt-2">Lista e gestão de clientes.</p>
        <div className="mt-4 text-sm text-muted-foreground">Carregando...</div>
      </main>
    }>
      <CustomersPageContent />
    </Suspense>
  )
}


