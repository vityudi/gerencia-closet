import { Suspense } from 'react'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

async function CustomersList({ storeId }: { storeId: string }) {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, email, phone, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    return <div className="text-sm text-muted-foreground mt-4">Erro ao carregar clientes.</div>
  }

  const items = data as Array<{
    id: string
    full_name: string
    email?: string
    phone?: string
  }>
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

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string }> }) {
  const params = await searchParams
  const storeId = params?.store_id
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <p className="text-muted-foreground mt-2">Lista e gestão de clientes.</p>
      {storeId ? (
        <Suspense>
          <CustomersList storeId={storeId} />
        </Suspense>
      ) : <div className="text-sm text-muted-foreground mt-4">Selecione uma loja para visualizar.</div>}
    </main>
  )
}


