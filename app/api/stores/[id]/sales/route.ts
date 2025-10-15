import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const supabase = createSupabaseServiceClient()
    
    // Join with team_members to get seller information
    let query = supabase
      .from('sales')
      .select(`
        *,
        team_members (
          id,
          full_name,
          role
        )
      `)
      .eq('store_id', id)

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching sales:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    
    return Response.json({ items: data ?? [] })
  } catch (err) {
    console.error('Unexpected error in sales GET:', err)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 })
  }
}


