import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Unified endpoint for fetching all product-related configuration data
 * Combines attributes, columns, and column options in a single request
 * This replaces multiple individual requests and significantly improves performance
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    // Fetch product attributes without nested relationships
    const { data: attributes, error: attrError } = await supabase
      .from('product_attributes')
      .select('*')
      .eq('store_id', id)
      .order('position')

    if (attrError) {
      return NextResponse.json(
        { error: attrError.message },
        { status: 500 }
      )
    }

    // Fetch product columns without nested relationships
    const { data: columns, error: colError } = await supabase
      .from('product_columns')
      .select('*')
      .eq('store_id', id)
      .order('position')

    if (colError) {
      return NextResponse.json(
        { error: colError.message },
        { status: 500 }
      )
    }

    // Fetch attribute options separately
    const attributeIds = attributes?.map((a) => a.id) || []
    let attributeOptions: Array<{ id: string; attribute_id: string; value: string; position: number }> = []

    if (attributeIds.length > 0) {
      const { data: opts } = await supabase
        .from('product_attribute_options')
        .select('*')
        .in('attribute_id', attributeIds)

      attributeOptions = opts || []
    }

    // Enhance attributes with their options
    const enrichedAttributes = attributes?.map((attr) => ({
      ...attr,
      product_attribute_options: attributeOptions.filter((opt) => opt.attribute_id === attr.id),
    })) || []

    return NextResponse.json({
      attributes: enrichedAttributes,
      columns: columns ?? [],
    })
  } catch (error) {
    console.error('Error fetching product data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
