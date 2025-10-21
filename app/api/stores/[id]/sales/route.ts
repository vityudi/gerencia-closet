import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const createSaleSchema = z.object({
  customer_id: z.string().uuid('ID do cliente inválido'),
  team_member_id: z.string().uuid('ID do vendedor inválido'),
  payment_method: z.string().min(1, 'Método de pagamento é obrigatório'),
  status: z.enum(['Concluída', 'Pendente', 'Cancelada']).default('Concluída'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid('ID do produto inválido'),
      quantity: z.number().positive('Quantidade deve ser maior que 0'),
    })
  ).min(1, 'Sale must have at least one product'),
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

    // Join with customers, team_members, and sale_items to get complete information
    let query = supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          full_name,
          email,
          phone
        ),
        team_members (
          id,
          full_name,
          role
        ),
        sale_items (
          id,
          product_id,
          quantity,
          unit_price,
          subtotal
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

    // Verify customer belongs to this store
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', parsed.data.customer_id)
      .eq('store_id', id)
      .single()

    if (customerError || !customer) {
      return new Response(
        JSON.stringify({ error: 'Cliente não encontrado nesta loja' }),
        { status: 404 }
      )
    }

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

    // Verify all products belong to this store and get their prices
    const productIds = parsed.data.items.map(item => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .eq('store_id', id)
      .in('id', productIds)

    if (productsError || !products || products.length !== productIds.length) {
      return new Response(
        JSON.stringify({ error: 'Um ou mais produtos não encontrados nesta loja' }),
        { status: 404 }
      )
    }

    // Calculate total from items
    const productMap = new Map(products.map(p => [p.id, p]))
    let total = 0
    const saleItems: Array<{ product_id: string; quantity: number; unit_price: number; subtotal: number }> = []

    for (const item of parsed.data.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Produto ${item.product_id} não encontrado` }),
          { status: 404 }
        )
      }

      const subtotal = Number(product.price) * item.quantity
      total += subtotal
      saleItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Number(product.price),
        subtotal,
      })
    }

    // Create sale
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        store_id: id,
        customer_id: parsed.data.customer_id,
        team_member_id: parsed.data.team_member_id,
        total,
        payment_method: parsed.data.payment_method,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
      })
      .select(`
        *,
        customers (
          id,
          full_name,
          email,
          phone
        ),
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

    // Create sale items
    const itemsToInsert = saleItems.map(item => ({
      sale_id: sale.id,
      ...item,
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating sale items:', itemsError)
      // Delete the sale if items creation fails
      await supabase.from('sales').delete().eq('id', sale.id)
      return new Response(
        JSON.stringify({ error: 'Erro ao adicionar itens à venda', details: itemsError.message }),
        { status: 500 }
      )
    }

    // Fetch the complete sale with items
    const { data: completeSale, error: fetchError } = await supabase
      .from('sales')
      .select(`
        *,
        customers (
          id,
          full_name,
          email,
          phone
        ),
        team_members (
          id,
          full_name,
          role
        ),
        sale_items (
          id,
          product_id,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq('id', sale.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete sale:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Venda criada mas erro ao buscar dados completos' }),
        { status: 500 }
      )
    }

    return Response.json(completeSale, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in sales POST:', err)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}

