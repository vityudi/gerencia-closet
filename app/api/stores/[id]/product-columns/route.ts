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
      .from('product_columns')
      .select('*')
      .eq('store_id', id)
      .order('position')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ columns: data ?? [] })
  } catch (error) {
    console.error('Error fetching product columns:', error)
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
    const { field_name, label, is_visible, is_editable, column_type, width, position } = body

    if (!field_name || !label) {
      return NextResponse.json(
        { error: 'field_name and label are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_columns')
      .insert([
        {
          store_id: id,
          field_name,
          label,
          is_visible: is_visible ?? true,
          is_editable: is_editable ?? true,
          column_type: column_type || 'text',
          width: width || 'auto',
          position: position ?? 0,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating product column:', error)
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
    const { columnId, label, is_visible, is_editable, column_type, width, position } = body

    if (!columnId) {
      return NextResponse.json(
        { error: 'columnId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_columns')
      .update({
        label,
        is_visible,
        is_editable,
        column_type,
        width,
        position,
        updated_at: new Date().toISOString(),
      })
      .eq('id', columnId)
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
    console.error('Error updating product column:', error)
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
    const columnId = searchParams.get('columnId')

    if (!columnId) {
      return NextResponse.json(
        { error: 'columnId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase
      .from('product_columns')
      .delete()
      .eq('id', columnId)
      .eq('store_id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product column:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
