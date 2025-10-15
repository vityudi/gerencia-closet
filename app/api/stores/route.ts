import { z } from 'zod'
import { createSupabaseServiceClient } from '@/lib/supabase/server'

const createStoreSchema = z.object({
  name: z.string().min(2),
  owner_user_id: z.string().uuid(),
  metadata: z.record(z.any()).optional()
})

export async function GET() {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return Response.json({ items: data ?? [] })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createStoreSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 })
    }
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase.from('stores').insert(parsed.data).select('*').single()
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    return Response.json(data)
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erro inesperado' }), { status: 500 })
  }
}


