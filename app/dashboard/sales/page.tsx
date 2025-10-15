import { Suspense } from 'react'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

async function SalesList({ storeId }: { storeId: string }) {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('sales')
    .select('id, total, created_at, payment_method, status')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sales:', error)
    console.error('Store ID:', storeId)
    console.error('Environment:', process.env.NODE_ENV)
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <div className="text-sm font-medium text-red-800">Erro ao carregar vendas</div>
        <div className="text-xs text-red-600 mt-1">Store ID: {storeId}</div>
        <div className="text-xs text-red-600">Error: {error.message}</div>
        {error.code && <div className="text-xs text-red-600">Code: {error.code}</div>}
      </div>
    )
  }

  const items = data as Array<{
    id: string
    total: number
    created_at: string
    payment_method: string
    status: string
  }>
  return (
    <div className="mt-4 space-y-2">
      {items?.length ? items.map((s) => (
        <div key={s.id} className="rounded border p-3">
          <div className="font-medium">Total: R$ {Number(s.total).toFixed(2)} • {new Date(s.created_at).toLocaleString('pt-BR')}</div>
          <div className="text-sm text-muted-foreground">Pagamento: {s.payment_method} • Status: {s.status}</div>
        </div>
      )) : <div className="text-sm text-muted-foreground">Nenhuma venda.</div>}
    </div>
  )
}

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams
  const storeId = params?.store_id
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <p className="text-muted-foreground mt-2">Pedidos e relatórios por período.</p>
      {storeId ? (
        <Suspense>
          <SalesList storeId={storeId} />
        </Suspense>
      ) : <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar.</div>}
    </main>
  )
}


