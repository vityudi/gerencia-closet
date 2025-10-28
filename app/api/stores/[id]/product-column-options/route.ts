import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const columnId = searchParams.get('columnId')

    const supabase = createSupabaseServiceClient()

    if (columnId) {
      // Get options for a specific column
      const { data, error } = await supabase
        .from('product_column_options')
        .select('*')
        .eq('column_id', columnId)
        .order('position')

      if (error) {
        console.error('Error fetching column options:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ options: data ?? [] })
    } else {
      // Get all options for all columns in this store
      // First get all column IDs for this store
      const { data: columnIds, error: colError } = await supabase
        .from('product_columns')
        .select('id')
        .eq('store_id', id)

      if (colError) {
        console.error('Error fetching column IDs:', colError)
        return NextResponse.json(
          { error: colError.message },
          { status: 500 }
        )
      }

      if (!columnIds || columnIds.length === 0) {
        return NextResponse.json({ options: [] })
      }

      const columnIdValues = columnIds.map((col) => col.id)

      const { data, error } = await supabase
        .from('product_column_options')
        .select('*')
        .in('column_id', columnIdValues)
        .order('position')

      if (error) {
        console.error('Error fetching column options:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ options: data ?? [] })
    }
  } catch (error) {
    console.error('Error fetching column options:', error)
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
    const { columnId, value } = body

    if (!columnId || !value) {
      return NextResponse.json(
        { error: 'columnId and value are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Get the highest position for this column
    const { data: existingOptions, error: posError } = await supabase
      .from('product_column_options')
      .select('position')
      .eq('column_id', columnId)
      .order('position', { ascending: false })
      .limit(1)

    if (posError) {
      console.error('Error fetching existing options:', posError)
    }

    const nextPosition = (existingOptions?.[0]?.position ?? -1) + 1

    const { data, error } = await supabase
      .from('product_column_options')
      .insert([
        {
          column_id: columnId,
          value: String(value).trim(),
          position: nextPosition,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting column option:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating column option:', error)
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
    await params
    const body = await req.json()
    const { optionId, value, position } = body

    if (!optionId) {
      return NextResponse.json(
        { error: 'optionId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { data, error } = await supabase
      .from('product_column_options')
      .update({
        value,
        position,
        updated_at: new Date().toISOString(),
      })
      .eq('id', optionId)
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
    console.error('Error updating column option:', error)
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
    await params
    const { searchParams } = new URL(req.url)
    const optionId = searchParams.get('optionId')

    if (!optionId) {
      return NextResponse.json(
        { error: 'optionId is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase
      .from('product_column_options')
      .delete()
      .eq('id', optionId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting column option:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
