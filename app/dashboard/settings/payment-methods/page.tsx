'use client'

import { PaymentMethodsSettings } from '@/components/payment-methods-settings'

export default function PaymentMethodsPage() {
  return (
    <main className="p-6">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Métodos de Pagamento</h1>
          <p className="text-muted-foreground mt-2">
            Configure os métodos de pagamento disponíveis para suas vendas
          </p>
        </div>

        <PaymentMethodsSettings />
      </div>
    </main>
  )
}
