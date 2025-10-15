import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabaseServer = await createSupabaseServerClient()
  const { data: { user }, error } = await supabaseServer.auth.getUser()
  if (error || !user) return new Response(JSON.stringify({ error: 'não autenticado' }), { status: 401 })

  const svc = createSupabaseServiceClient()
  const { data: meta } = await svc.from('users_meta').select('store_id, role, email').eq('id', user.id).single()

  return Response.json({ user_id: user.id, email: user.email, store_id: meta?.store_id ?? null, role: meta?.role ?? null })
}


