import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const supabase = createSupabaseServiceClient()
  let query = supabase.from('sales').select('*').eq('store_id', params.id)

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}


