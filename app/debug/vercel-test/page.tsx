import { createSupabaseServiceClient } from '@/lib/supabase/server'

type TestResults = {
  env?: {
    hasSupabaseUrl: boolean
    hasServiceKey: boolean
    hasAnonKey: boolean
    supabaseUrl?: string
    serviceKeyPrefix?: string
    anonKeyPrefix?: string
    nodeEnv?: string
    vercelEnv?: string
    isVercel: boolean
    allEnvKeys?: string[]
  }
  stores?: {
    success: boolean
    error: string | null
    count: number
    data: unknown[]
  }
  products?: {
    success: boolean
    error: string | null
    code?: string | null
    count: number
    data: unknown[]
  }
  globalError?: string
}

export default async function VercelTestPage() {
  const results: TestResults = {}
  
  try {
    const supabase = createSupabaseServiceClient()
    
    // Test environment variables
    results.env = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      isVercel: !!process.env.VERCEL,
      allEnvKeys: Object.keys(process.env).filter(key => 
        key.includes('SUPABASE') || key.includes('NEXT_PUBLIC')
      ).sort()
    }
    
    // Test Supabase connection
    try {
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .limit(5)
      
      results.stores = {
        success: !storesError,
        error: storesError?.message || null,
        count: stores?.length || 0,
        data: stores || []
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      results.stores = {
        success: false,
        error: errorMessage,
        count: 0,
        data: []
      }
    }
    
    // Test products table
    try {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, store_id')
        .limit(5)
      
      results.products = {
        success: !productsError,
        error: productsError?.message || null,
        code: productsError?.code || null,
        count: products?.length || 0,
        data: products || []
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error'
      results.products = {
        success: false,
        error: errorMessage,
        count: 0,
        data: []
      }
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    results.globalError = errorMessage
  }
  
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vercel Deployment Test</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(results.env, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Stores Test</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(results.stores, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Products Test</h2>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(results.products, null, 2)}
          </pre>
        </div>
        
        {results.globalError && (
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <h2 className="text-lg font-semibold mb-3 text-red-800">Global Error</h2>
            <pre className="text-sm text-red-600">
              {results.globalError}
            </pre>
          </div>
        )}
      </div>
    </main>
  )
}