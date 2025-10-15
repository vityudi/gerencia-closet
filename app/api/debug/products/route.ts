import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient()
    
    console.log('Testing direct table access...')
    
    // Test basic table access
    const { data: tableTest, error: tableError } = await supabase
      .from('products')
      .select('count')
      .limit(0)
    
    if (tableError) {
      console.error('Table access error:', tableError)
      return Response.json({ 
        error: 'Table access failed', 
        details: tableError 
      }, { status: 500 })
    }
    
    // Test simple select
    const { data: simpleData, error: simpleError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5)
    
    if (simpleError) {
      console.error('Simple select error:', simpleError)
      return Response.json({ 
        error: 'Simple select failed', 
        details: simpleError 
      }, { status: 500 })
    }
    
    // Test with store_id filter
    const { data: filteredData, error: filteredError } = await supabase
      .from('products')
      .select('id, name, store_id')
      .limit(5)
    
    return Response.json({
      success: true,
      tableAccess: !!tableTest,
      simpleSelect: { count: simpleData?.length || 0, data: simpleData },
      filteredSelect: { 
        count: filteredData?.length || 0, 
        data: filteredData,
        error: filteredError?.message || null
      }
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return Response.json({ 
      error: 'Unexpected error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}