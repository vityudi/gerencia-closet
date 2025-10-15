import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('store_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error in team members GET:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return Response.json({ items: data ?? [] })
  } catch (err) {
    console.error('Unexpected error in team members GET:', err)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 })
  }
}