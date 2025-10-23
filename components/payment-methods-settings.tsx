'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IconTrash, IconPlus, IconLoader2 } from '@tabler/icons-react'
import { useSelectedStoreId } from '@/hooks/use-store'

interface PaymentMethod {
  id: string
  name: string
  codigo: string | null
  parcelas: string
  created_at: string
}

const PARCELAS_OPTIONS = ['À Vista', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', '11x', '12x']

export function PaymentMethodsSettings() {
  const storeId = useSelectedStoreId()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [newMethod, setNewMethod] = useState('')
  const [newCodigo, setNewCodigo] = useState('')
  const [newParcelas, setNewParcelas] = useState('À Vista')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch payment methods
  useEffect(() => {
    if (!storeId) return

    const fetchPaymentMethods = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/stores/${storeId}/payment-methods`)

        if (!response.ok) {
          throw new Error('Falha ao processar Métodos de Pagamento')
        }

        const data = await response.json()
        setPaymentMethods(data.items || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Houve um erro ao processar Métodos de Pagamento')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [storeId])

  const validateCodigo = (code: string): boolean => {
    if (code === '') return true // Optional field
    return /^\d{1,3}$/.test(code)
  }

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMethod.trim()) {
      setError('Insira o nome do Método de Pagamento')
      return
    }

    if (!validateCodigo(newCodigo)) {
      setError('Código deve ter no máximo 3 números')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/stores/${storeId}/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMethod.trim(),
          codigo: newCodigo || null,
          parcelas: newParcelas,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao adicionar Método de Pagamento')
      }

      const data = await response.json()
      setPaymentMethods([...paymentMethods, data])
      setNewMethod('')
      setNewCodigo('')
      setNewParcelas('À Vista')
      setSuccess('Método de Pagamento adicionado com sucesso')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Houve um erro ao adicionar Método de Pagamento')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm('Tem certeza que deseja deletar este Método de Pagamento?')) {
      return
    }

    try {
      setError(null)
      const response = await fetch(`/api/stores/${storeId}/payment-methods/${methodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao deletar Método de Pagamento')
      }

      setPaymentMethods(paymentMethods.filter((m) => m.id !== methodId))
      setSuccess('Método de Pagamento removido com sucesso')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Houve um erro ao deletar Método de Pagamento')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>
          Adicione ou remova métodos de pagamento disponíveis para vendas em sua loja
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new payment method form */}
        <form onSubmit={handleAddPaymentMethod} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Input
                placeholder="Nome (ex: Cartão de Crédito)"
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                disabled={submitting}
                maxLength={50}
              />
            </div>

            <div>
              <Input
                placeholder="Código (0-999, opcional)"
                value={newCodigo}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 3) {
                    setNewCodigo(value)
                  }
                }}
                disabled={submitting}
                maxLength={3}
              />
            </div>

            <div>
              <Select value={newParcelas} onValueChange={setNewParcelas} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Parcelas" />
                </SelectTrigger>
                <SelectContent>
                  {PARCELAS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !newMethod.trim()}
            className="w-full md:w-auto gap-2"
          >
            {submitting ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconPlus className="h-4 w-4" />
            )}
            Adicionar
          </Button>
        </form>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            {success}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Payment methods list */}
        {!loading && paymentMethods.length === 0 && (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sem Métodos de Pagamento configurados. Insira um novo para começar.
            </p>
          </div>
        )}

        {!loading && paymentMethods.length > 0 && (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="font-medium">
                      {method.name}
                    </Badge>
                    {method.codigo && (
                      <Badge variant="outline" className="text-xs">
                        Código: {method.codigo}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {method.parcelas}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info message */}
        {!loading && paymentMethods.length > 0 && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
            Os Métodos de Pagamento aparecem na tela de Nova Venda para serem selecionados.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
