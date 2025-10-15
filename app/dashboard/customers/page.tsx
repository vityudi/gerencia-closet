import { Suspense } from 'react'

async function CustomersList({ storeId }: { storeId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/stores/${storeId}/customers`, { cache: 'no-store' })
  const json = await res.json()
  const items = json.items as any[]
  return (
    <div className="mt-4 space-y-2">
      {items?.length ? items.map((c) => (
        <div key={c.id} className="rounded border p-3">
          <div className="font-medium">{c.full_name}</div>
          <div className="text-sm text-muted-foreground">{c.email ?? '—'} • {c.phone ?? '—'}</div>
        </div>
      )) : <div className="text-sm text-muted-foreground">Nenhum cliente.</div>}
    </div>
  )
}

export default async function CustomersPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  const storeId = searchParams?.store_id
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <p className="text-muted-foreground mt-2">Lista e gestão de clientes.</p>
      {storeId ? (
        <Suspense>
          {/* @ts-expect-error Server Component */}
          <CustomersList storeId={storeId} />
        </Suspense>
      ) : <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar.</div>}
    </main>
  )
}


