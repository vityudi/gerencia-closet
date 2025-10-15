import { z } from 'zod'
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server'

const setStoreSchema = z.object({ store_id: z.string().uuid().nullable() })

export async function GET() {
  const supabaseServer = await createSupabaseServerClient()
  const { data: { user }, error } = await supabaseServer.auth.getUser()
  if (error || !user) return new Response(JSON.stringify({ error: 'não autenticado' }), { status: 401 })
  const svc = createSupabaseServiceClient()
  const { data, error: err } = await svc.from('users_meta').select('store_id').eq('id', user.id).single()
  if (err) return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  return Response.json(data)
}

export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient()
    const { data: { user }, error } = await supabaseServer.auth.getUser()
    if (error || !user) return new Response(JSON.stringify({ error: 'não autenticado' }), { status: 401 })

    const json = await req.json()
    const parsed = setStoreSchema.safeParse(json)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 })
    }
    const { store_id } = parsed.data
    const svc = createSupabaseServiceClient()
    const { data, error: err } = await svc.from('users_meta').update({ store_id }).eq('id', user.id).select('store_id').single()
    if (err) return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    return Response.json(data)
  } catch {
    return new Response(JSON.stringify({ error: 'erro inesperado' }), { status: 500 })
  }
}


