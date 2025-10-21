import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSaleSchema = z.object({
  team_member_id: z.string().uuid('ID do vendedor inválido'),
  total: z.number().positive('Valor deve ser maior que 0'),
  payment_method: z.string().min(1, 'Método de pagamento é obrigatório'),
  status: z.enum(['Concluída', 'Pendente', 'Cancelada']).default('Concluída'),
})

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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Validate request body
    const parsed = createSaleSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten() }),
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Verify team member belongs to this store
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('id')
      .eq('id', parsed.data.team_member_id)
      .eq('store_id', id)
      .single()

    if (teamError || !teamMember) {
      return new Response(
        JSON.stringify({ error: 'Vendedor não encontrado nesta loja' }),
        { status: 404 }
      )
    }

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        store_id: id,
        team_member_id: parsed.data.team_member_id,
        total: parsed.data.total,
        payment_method: parsed.data.payment_method,
        status: parsed.data.status,
      })
      .select(`
        *,
        team_members (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (saleError) {
      console.error('Error creating sale:', saleError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar venda', details: saleError.message }),
        { status: 500 }
      )
    }

    return Response.json(sale, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in sales POST:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}

