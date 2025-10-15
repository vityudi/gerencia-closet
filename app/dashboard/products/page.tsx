import { Suspense } from 'react'

async function ProductsList({ storeId }: { storeId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/stores/${storeId}/products`, { cache: 'no-store' })
  const json = await res.json()
  const items = json.items as Array<{
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


