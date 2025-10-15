import { Suspense } from 'react'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

async function ProductsList({ storeId }: { storeId: string }) {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    console.error('Store ID:', storeId)
    console.error('Environment:', process.env.NODE_ENV)
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
        <div className="text-sm font-medium text-red-800">Erro ao carregar produtos</div>
        <div className="text-xs text-red-600 mt-1">Store ID: {storeId}</div>
        <div className="text-xs text-red-600">Error: {error.message}</div>
        {error.code && <div className="text-xs text-red-600">Code: {error.code}</div>}
      </div>
    )
  }

  const items = data as Array<{
    id: string
    name: string
    sku: string
    price: number
    stock: number
  }>
  return (
    <div className="mt-4 space-y-2">
      {items?.length ? items.map((p) => (
        <div key={p.id} className="rounded border p-3">
          <div className="font-medium">{p.name}</div>
          <div className="text-sm text-muted-foreground">SKU: {p.sku} • Preço: R$ {Number(p.price).toFixed(2)} • Estoque: {p.stock}</div>
        </div>
      )) : <div className="text-sm text-muted-foreground">Nenhum produto.</div>}
    </div>
  )
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams
  const storeId = params?.store_id
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Produtos</h1>
      <p className="text-muted-foreground mt-2">Catálogo de produtos por loja.</p>
      {storeId ? (
        <Suspense>
          <ProductsList storeId={storeId} />
        </Suspense>
      ) : <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar.</div>}
    </main>
  )
}


