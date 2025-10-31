import { createSupabaseServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createSupabaseServiceClient()

    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', id)
      .order('created_at', { ascending: false })

    if (productsError) return new Response(JSON.stringify({ error: productsError.message }), { status: 500 })

    // Fetch variations separately and attach to products
    if (products && products.length > 0) {
      const { data: variations, error: varsError } = await supabase
        .from('product_variations')
        .select('*')
        .in('product_id', products.map((p) => p.id))

      if (!varsError && variations) {
        const variationsByProductId = variations.reduce((acc, v) => {
          if (!acc[v.product_id]) acc[v.product_id] = []
          acc[v.product_id].push(v)
          return acc
        }, {} as Record<string, typeof variations>)

        const productsWithVariations = products.map((p) => ({
          ...p,
          product_variations: variationsByProductId[p.id] || [],
        }))
        return Response.json({ items: productsWithVariations })
      }
    }

    return Response.json({ items: products ?? [] })
  } catch (error) {
    console.error('Error fetching products:', error)
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
    const {
      codigo,
      name,
      marca,
      categoria,
      subcategoria,
      grupo,
      subgrupo,
      departamento,
      secao,
      estacao,
      colecao,
      descricao,
      observacao,
      fabricante,
      fornecedor,
      ncm,
      cest,
      custo,
      preco1,
      preco2,
      preco3,
      stock = 0,
      // Variations support: array of {attributeId, values: [], stock}
      // When variations are provided, creates multiple products with combinations
      variationGroups,
    } = body

    if (!codigo || !name) {
      return NextResponse.json(
        { error: 'Código e Nome são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Base product data
    const baseProduct = {
      store_id: id,
      codigo,
      name,
      marca,
      categoria,
      subcategoria,
      grupo,
      subgrupo,
      departamento,
      secao,
      estacao,
      colecao,
      descricao,
      observacao,
      fabricante,
      fornecedor,
      ncm,
      cest,
      custo,
      preco1: preco1 || 0,
      preco2,
      preco3,
    }

    // Case 1: Simple product without variations
    if (!variationGroups || variationGroups.length === 0) {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...baseProduct, stock }])
        .select()
        .single()

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ...data,
        product_variations: [],
      }, { status: 201 })
    }

    // Case 2: Product with variations - create multiple products
    // First, generate all combinations
    interface VariationGroup {
      attributeId: string
      values: Array<{
        value: string
        stock: number
      }>
    }

    const generateCombinations = (groups: VariationGroup[]) => {
      if (groups.length === 0) return []

      const combinations: Array<{
        variations: Array<{ attributeId: string; value: string }>
        stock: number
      }> = []

      const recurse = (
        index: number,
        currentCombination: Array<{ attributeId: string; value: string }>,
        currentStock: number
      ) => {
        if (index === groups.length) {
          combinations.push({
            variations: [...currentCombination],
            stock: currentStock,
          })
          return
        }

        const group = groups[index]
        group.values.forEach((item) => {
          recurse(
            index + 1,
            [
              ...currentCombination,
              { attributeId: group.attributeId, value: item.value },
            ],
            item.stock
          )
        })
      }

      recurse(0, [], stock)
      return combinations
    }

    const combinations = generateCombinations(variationGroups)

    if (combinations.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma combinação de variação foi gerada' },
        { status: 400 }
      )
    }

    // Create all products and their variations in a transaction
    const productsToInsert = combinations.map((combo) => {
      // Generate unique codigo for each variation by appending variation values
      const variationSuffix = combo.variations
        .map((v) => v.value)
        .join('-')

      return {
        ...baseProduct,
        codigo: `${baseProduct.codigo}-${variationSuffix}`,
        stock: combo.stock,
      }
    })

    const { data: createdProducts, error: createError } = await supabase
      .from('products')
      .insert(productsToInsert)
      .select()

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    // Build variations array that maps each product to its variation attributes
    const variationsToInsert: Array<{ product_id: string; attribute_id: string; value: string }> = []
    if (createdProducts && createdProducts.length > 0) {
      createdProducts.forEach((product, index) => {
        const combo = combinations[index]
        if (combo && combo.variations) {
          combo.variations.forEach((variation) => {
            variationsToInsert.push({
              product_id: product.id,
              attribute_id: variation.attributeId,
              value: variation.value,
            })
          })
        }
      })
    }

    // For bulk product creation with variations, we need to look up the attribute_option_id
    // for each value. This requires fetching the options first.
    if (variationsToInsert.length > 0) {
      // Fetch all product_attribute_options to map value -> id
      const { data: allOptions } = await supabase
        .from('product_attribute_options')
        .select('id, attribute_id, value')

      const optionMap = new Map<string, string>() // key: "attributeId:value" -> id
      allOptions?.forEach((opt) => {
        optionMap.set(`${opt.attribute_id}:${opt.value}`, opt.id)
      })

      // Convert variationsToInsert to use attribute_option_id
      const variationsWithOptionId = variationsToInsert
        .map((v) => {
          const key = `${v.attribute_id}:${v.value}`
          const optionId = optionMap.get(key)
          if (!optionId) return null

          return {
            product_id: v.product_id,
            attribute_option_id: optionId,
          }
        })
        .filter((v) => v !== null) as Array<{
        product_id: string
        attribute_option_id: string
      }>

      if (variationsWithOptionId.length > 0) {
        const { error: varError } = await supabase
          .from('product_variations')
          .insert(variationsWithOptionId)

        if (varError) {
          console.error('Error creating variations:', varError)
          // Don't fail the entire operation, variations are secondary
        }
      }
    }

    // Fetch complete products with variations (fetched separately)
    const productIds = createdProducts?.map((p) => p.id) || []
    const { data: allVariations } = await supabase
      .from('product_variations')
      .select('*')
      .in('product_id', productIds)

    const variationsByProductId = allVariations?.reduce((acc, v) => {
      if (!acc[v.product_id]) acc[v.product_id] = []
      acc[v.product_id].push(v)
      return acc
    }, {} as Record<string, typeof allVariations>) || {}

    const completeProducts = createdProducts?.map((p) => ({
      ...p,
      product_variations: variationsByProductId[p.id] || [],
    })) || []

    return NextResponse.json(completeProducts, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productId, product_variations, ...updateData } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()

    // Filter out any relationship fields that shouldn't be updated
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => {
        // Only allow actual product table columns, not relationships
        const allowedFields = [
          'name', 'codigo', 'sku', 'price', 'stock', 'short_id',
          'marca', 'categoria', 'subcategoria', 'grupo', 'subgrupo',
          'departamento', 'secao', 'estacao', 'colecao',
          'descricao', 'observacao', 'fabricante', 'fornecedor',
          'ncm', 'cest', 'custo', 'preco1', 'preco2', 'preco3'
        ]
        return allowedFields.includes(key)
      })
    )

    // Update product (don't select, just verify success)
    const { error: updateError } = await supabase
      .from('products')
      .update({
        ...fieldsToUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('store_id', id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Fetch the updated product
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('store_id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    // For now, skip fetching variations to debug the schema cache error
    // The product is successfully updated, return it without variations temporarily
    return NextResponse.json({
      ...product,
      product_variations: [],
    })
  } catch (error) {
    console.error('Error updating product:', error)
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
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('store_id', id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


