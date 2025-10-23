import { createSupabaseServiceClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; methodId: string }> }
) {
  const { id, methodId } = await params

  try {
    const supabase = createSupabaseServiceClient()

    // Verify the payment method belongs to this store
    const { data: method, error: fetchError } = await supabase
      .from('payment_methods')
      .select('id, store_id')
      .eq('id', methodId)
      .single()

    if (fetchError || !method) {
      return new Response(
        JSON.stringify({ error: 'Payment method not found' }),
        { status: 404 }
      )
    }

    if (method.store_id !== id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId)

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
