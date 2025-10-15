export async function POST(req: Request) {
  try {
    const body = await req.json()
    const message: string = body?.message ?? ''
    if (!message) {
      return new Response(JSON.stringify({ error: 'message requerido' }), { status: 400 })
    }
    // Placeholder: integração com MCP real ocorrerá aqui
    const reply = `Você disse: ${message}`
    return Response.json({ reply, actions: [], trace_id: crypto.randomUUID() })
  } catch {
    return new Response(JSON.stringify({ error: 'erro inesperado' }), { status: 500 })
  }
}


