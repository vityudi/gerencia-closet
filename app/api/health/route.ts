import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient()
    
    // Test each table individually
    const { data: stores, error: storesError } = await supabase.from('stores').select('id, name').limit(1)
    const { data: products, error: productsError } = await supabase.from('products').select('id').limit(1)
    const { data: customers, error: customersError } = await supabase.from('customers').select('id').limit(1)
    const { data: sales, error: salesError } = await supabase.from('sales').select('id').limit(1)
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: {
        connected: !storesError,
        tables: {
          stores: { 
            accessible: !storesError, 
            error: storesError?.message || null,
            count: stores?.length || 0 
          },
          products: { 
            accessible: !productsError, 
            error: productsError?.message || null,
            count: products?.length || 0 
          },
          customers: { 
            accessible: !customersError, 
            error: customersError?.message || null,
            count: customers?.length || 0 
          },
          sales: { 
            accessible: !salesError, 
            error: salesError?.message || null,
            count: sales?.length || 0 
          }
        }
      },
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }
    
    return Response.json(health)
  } catch (error) {
    return Response.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


