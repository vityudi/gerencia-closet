import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}


