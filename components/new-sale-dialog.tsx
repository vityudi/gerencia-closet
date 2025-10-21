"use client"

import * as React from "react"
import { IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type TeamMember = {
  id: string
  full_name: string
  role: string
  status: string
}

interface NewSaleDialogProps {
  storeId: string
  onSaleCreated?: () => void
}

export function NewSaleDialog({ storeId, onSaleCreated }: NewSaleDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  const [loadingTeamMembers, setLoadingTeamMembers] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = React.useState({
    team_member_id: "",
    total: "",
    payment_method: "",
    status: "Concluída",
  })

  // Fetch team members when dialog opens
  React.useEffect(() => {
    if (!open) return

    const fetchTeamMembers = async () => {
      try {
        setLoadingTeamMembers(true)
        const res = await fetch(`/api/stores/${storeId}/team`)
        const data = await res.json()
        if (data.items) {
          setTeamMembers(data.items)
        }
      } catch (error) {
        console.error("Failed to fetch team members:", error)
      } finally {
        setLoadingTeamMembers(false)
      }
    }

    fetchTeamMembers()
  }, [open, storeId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.team_member_id) {
      newErrors.team_member_id = "Selecione um vendedor"
    }
    if (!formData.total) {
      newErrors.total = "Valor é obrigatório"
    } else if (parseFloat(formData.total) <= 0) {
      newErrors.total = "Valor deve ser maior que 0"
    }
    if (!formData.payment_method) {
      newErrors.payment_method = "Selecione um método de pagamento"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/stores/${storeId}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_member_id: formData.team_member_id,
          total: parseFloat(formData.total),
          payment_method: formData.payment_method,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar venda")
      }

      setFormData({
        team_member_id: "",
        total: "",
        payment_method: "",
        status: "Concluída",
      })
      setErrors({})
      setOpen(false)
      onSaleCreated?.()
    } catch (error) {
      console.error("Error creating sale:", error)
      alert(error instanceof Error ? error.message : "Erro ao criar venda")
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethods = [
    "Cartão de Crédito",
    "Cartão de Débito",
    "PIX",
    "Dinheiro",
    "Boleto",
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <IconPlus className="h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da venda para registrá-la no sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Vendedor */}
          <div className="space-y-2">
            <Label htmlFor="team-member">Vendedor *</Label>
            <Select
              value={formData.team_member_id}
              onValueChange={(value) =>
                setFormData({ ...formData, team_member_id: value })
              }
              disabled={loadingTeamMembers}
            >
              <SelectTrigger id="team-member">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <span>{member.full_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_member_id && (
              <p className="text-sm text-red-600">{errors.team_member_id}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="total">Valor (R$) *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.total}
              onChange={(e) =>
                setFormData({ ...formData, total: e.target.value })
              }
            />
            {errors.total && (
              <p className="text-sm text-red-600">{errors.total}</p>
            )}
            {formData.total && (
              <p className="text-sm text-muted-foreground">
                Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseFloat(formData.total))}
              </p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-red-600">{errors.payment_method}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Venda"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
