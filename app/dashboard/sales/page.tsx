import { Suspense } from 'react'

async function SalesList({ storeId }: { storeId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/stores/${storeId}/sales`, { cache: 'no-store' })
  const json = await res.json()
  const items = json.items as Array<{
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


