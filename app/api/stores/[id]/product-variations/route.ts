import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(_req.url)
    const productId = searchParams.get('productId')

    const supabase = createSupabaseServiceClient()

    let query = supabase
      .from('product_variations')
      .select('*, product_attributes(id, name, label)')
      .eq('products.store_id', id)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data, error } = await query.order('created_at')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ variations: data ?? [] })
  } catch (error) {
    console.error('Error fetching product variations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    const body = await req.json()
    const { productId, attributeId, value } = body

    if (!productId || !attributeId || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, attributeId, value' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_variations')
      .insert([
        {
          product_id: productId,
          attribute_id: attributeId,
          value,
        },
      ])
      .select('*, product_attributes(id, name, label)')
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating product variation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const variationId = searchParams.get('variationId')

    if (!variationId) {
      return NextResponse.json(
        { error: 'Variation ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Get the variation to verify it belongs to this store
    const { data: variation } = await supabase
      .from('product_variations')
      .select('product_id, products(store_id)')
      .eq('id', variationId)
      .single()

    if (!variation || !Array.isArray(variation.products) || variation.products.length === 0 || (variation.products[0] as Record<string, unknown>).store_id !== id) {
      return NextResponse.json(
        { error: 'Variation not found or unauthorized' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('product_variations')
      .delete()
      .eq('id', variationId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product variation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
