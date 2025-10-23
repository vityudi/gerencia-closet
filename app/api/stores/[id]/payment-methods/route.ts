import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('store_id', id)
      .order('name')

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return Response.json({ items: data ?? [] })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await req.json()
    const { name, codigo, parcelas } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Insira o nome do Método de Pagamento' }),
        { status: 400 }
      )
    }

    // Validate codigo: max 3 numbers, optional
    if (codigo !== undefined && codigo !== null) {
      if (!/^\d{1,3}$/.test(codigo)) {
        return new Response(
          JSON.stringify({ error: 'Código deve ter no máximo 3 números' }),
          { status: 400 }
        )
      }
    }

    // Validate parcelas
    const validParcelas = ['À Vista', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', '11x', '12x']
    if (parcelas && !validParcelas.includes(parcelas)) {
      return new Response(
        JSON.stringify({ error: 'Parcela inválida' }),
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        store_id: id,
        name: name.trim(),
        codigo: codigo || null,
        parcelas: parcelas || 'À Vista',
      })
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating payment method:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
