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

    // First, get all product IDs for this store
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', id)

    const productIds = products?.map((p) => p.id) || []

    if (productIds.length === 0) {
      return NextResponse.json({ variations: [] })
    }

    // Then get variations for those products
    let query = supabase
      .from('product_variations')
      .select('*')
      .in('product_id', productIds)

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
    const { productId, attributeOptionId } = body

    if (!productId || !attributeOptionId) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, attributeOptionId' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_variations')
      .insert([
        {
          product_id: productId,
          attribute_option_id: attributeOptionId,
        },
      ])
      .select('*')
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
      .select('product_id')
      .eq('id', variationId)
      .single()

    if (!variation || !variation.product_id) {
      return NextResponse.json(
        { error: 'Variation not found' },
        { status: 404 }
      )
    }

    // Verify the product belongs to this store
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', variation.product_id)
      .eq('store_id', id)
      .single()

    if (!product) {
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
