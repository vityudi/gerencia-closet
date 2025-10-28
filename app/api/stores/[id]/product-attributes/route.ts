import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_attributes')
      .select('*, product_attribute_options(*)')
      .eq('store_id', id)
      .order('position')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ attributes: data ?? [] })
  } catch (error) {
    console.error('Error fetching product attributes:', error)
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
    const { id } = await params
    const body = await req.json()
    const { name, label, is_variation, is_required, options } = body

    const supabase = createSupabaseServiceClient()

    // Create the attribute
    const { data: attribute, error: attrError } = await supabase
      .from('product_attributes')
      .insert([
        {
          store_id: id,
          name,
          label,
          is_variation: is_variation || false,
          is_required: is_required || false,
        },
      ])
      .select()
      .single()

    if (attrError) {
      return NextResponse.json(
        { error: attrError.message },
        { status: 500 }
      )
    }

    // Create options if provided
    if (options && options.length > 0) {
      const optionsData = options.map((opt: string, index: number) => ({
        attribute_id: attribute.id,
        value: opt,
        position: index,
      }))

      const { error: optError } = await supabase
        .from('product_attribute_options')
        .insert(optionsData)

      if (optError) {
        console.error('Error creating attribute options:', optError)
      }
    }

    return NextResponse.json(attribute, { status: 201 })
  } catch (error) {
    console.error('Error creating product attribute:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { attributeId, name, label, is_variation, is_required } = body

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_attributes')
      .update({
        name,
        label,
        is_variation,
        is_required,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attributeId)
      .eq('store_id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating product attribute:', error)
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
    const attributeId = searchParams.get('attributeId')

    if (!attributeId) {
      return NextResponse.json(
        { error: 'Attribute ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase
      .from('product_attributes')
      .delete()
      .eq('id', attributeId)
      .eq('store_id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product attribute:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
