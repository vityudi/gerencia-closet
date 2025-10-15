import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('store_id', id)
    .order('created_at', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}


