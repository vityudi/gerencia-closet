import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase envs ausentes: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set() {},
      remove() {}
    }
  })
}

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  
  console.log('Environment check:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasServiceKey: !!serviceKey,
    supabaseUrlLength: supabaseUrl?.length || 0,
    serviceKeyLength: serviceKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  })
  
  if (!supabaseUrl || !serviceKey) {
    const error = `Missing environment variables: ${!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : ''}${!serviceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`
    console.error(error)
    throw new Error(error)
  }
  
  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
}


