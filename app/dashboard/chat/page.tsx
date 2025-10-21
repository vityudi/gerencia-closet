"use client"

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

function ChatContent() {
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  async function sendMessage() {
    if (!message.trim()) return
    const current = message
    setMessage("")
    setHistory((h) => [...h, { role: 'user', content: current }])
    try {
      const res = await fetch('/api/mcp/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: current })
      })
      if (!res.ok) throw new Error('Falha ao contatar MCP')
      const data = await res.json()
      setHistory((h) => [...h, { role: 'assistant', content: data.reply ?? 'Sem resposta' }])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado'
      toast.error(errorMessage)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <p className="text-muted-foreground mt-2">Agente conversacional (MCP) para suporte.</p>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Agente Conversacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4 max-h-[50vh] overflow-auto border rounded p-3">
              {history.map((m, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{m.role === 'user' ? 'Você' : 'Assistente'}: </span>
                  <span>{m.content}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Digite sua mensagem..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null} />
              <Button onClick={sendMessage}>Enviar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando chat...</div>}>
      <ChatContent />
    </Suspense>
  )
}