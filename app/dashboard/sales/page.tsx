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
    return <div className="text-sm text-muted-foreground mt-4">Erro ao carregar vendas.</div>
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


