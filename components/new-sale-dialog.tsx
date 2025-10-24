"use client"

import * as React from "react"
import { IconX, IconSearch } from "@tabler/icons-react"
import { useCart } from "@/contexts/cart-context"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TeamMember = {
  id: string
  full_name: string
  role: string
  status: string
}

type Customer = {
  id: string
  full_name: string
  email: string
  phone: string
}

type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

type PaymentMethodType = {
  id: string
  name: string
  codigo: string | null
  parcelas: string
}

interface NewSaleDialogProps {
  storeId: string
  onSaleCreated?: () => void
}

export function NewSaleDialog({
  storeId,
  onSaleCreated
}: NewSaleDialogProps) {
  const { cart, addToCart, removeFromCart, clearCart, total, isModalOpen, setIsModalOpen, defaultTab: contextDefaultTab } = useCart()
  const [activeTab, setActiveTab] = React.useState<"add-product" | "cart">(contextDefaultTab)
  const [isLoading, setIsLoading] = React.useState(false)
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [products, setProducts] = React.useState<Product[]>([])
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodType[]>([])
  const [loadingTeamMembers, setLoadingTeamMembers] = React.useState(false)
  const [loadingCustomers, setLoadingCustomers] = React.useState(false)
  const [loadingProducts, setLoadingProducts] = React.useState(false)
  const [loadingPaymentMethods, setLoadingPaymentMethods] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Form state
  const [formData, setFormData] = React.useState({
    team_member_id: "",
    customer_id: "",
    payment_method: "",
    parcelas: "À Vista",
    status: "Concluída",
    notes: "",
  })

  // Local cart state for product search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedProductId, setSelectedProductId] = React.useState("")
  const [quantity, setQuantity] = React.useState("1")

  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false)

  // Clear cart confirmation dialog
  const [showClearCartDialog, setShowClearCartDialog] = React.useState(false)

  // Sync modal open state with context
  React.useEffect(() => {
    setActiveTab(contextDefaultTab)
  }, [contextDefaultTab])

  // Filter products based on search and not in cart
  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !cart.some((item) => item.product_id === p.id)
  )

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
  )

  // Get selected customer
  const selectedCustomer = customers.find((c) => c.id === formData.customer_id)

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (!isModalOpen) return

    const fetchData = async () => {
      try {
        // Fetch team members
        setLoadingTeamMembers(true)
        const teamRes = await fetch(`/api/stores/${storeId}/team`)
        if (!teamRes.ok) throw new Error('Failed to fetch team members')
        const teamData = await teamRes.json()
        if (teamData.items) {
          setTeamMembers(teamData.items)
        }

        // Fetch customers
        setLoadingCustomers(true)
        const custRes = await fetch(`/api/stores/${storeId}/customers`)
        if (!custRes.ok) throw new Error('Failed to fetch customers')
        const custData = await custRes.json()
        if (custData.items) {
          setCustomers(custData.items)
        }

        // Fetch products
        setLoadingProducts(true)
        const prodRes = await fetch(`/api/stores/${storeId}/products`)
        if (!prodRes.ok) throw new Error('Failed to fetch products')
        const prodData = await prodRes.json()
        if (prodData.items) {
          setProducts(prodData.items)
        }

        // Fetch payment methods
        setLoadingPaymentMethods(true)
        const paymentRes = await fetch(`/api/stores/${storeId}/payment-methods`)
        if (!paymentRes.ok) throw new Error('Failed to fetch payment methods')
        const paymentData = await paymentRes.json()
        if (paymentData.items) {
          setPaymentMethods(paymentData.items)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoadingTeamMembers(false)
        setLoadingCustomers(false)
        setLoadingProducts(false)
        setLoadingPaymentMethods(false)
      }
    }

    fetchData()
  }, [isModalOpen, storeId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.team_member_id) {
      newErrors.team_member_id = "Selecione um vendedor"
    }
    if (!formData.customer_id) {
      newErrors.customer_id = "Selecione um cliente"
    }
    if (cart.length === 0) {
      newErrors.cart = "Adicione pelo menos um produto"
    }
    if (!formData.payment_method) {
      newErrors.payment_method = "Selecione um método de pagamento"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddToCart = () => {
    if (!selectedProductId || !quantity) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const qty = parseInt(quantity)
    if (qty <= 0 || qty > product.stock) {
      alert(`Quantidade inválida. Disponível: ${product.stock}`)
      return
    }

    const subtotal = product.price * qty

    addToCart({
      product_id: product.id,
      product_name: product.name,
      quantity: qty,
      unit_price: product.price,
      subtotal,
    })

    setSelectedProductId("")
    setQuantity("1")
    setSearchQuery("")
  }

  const handleRemoveFromCart = (productId: string) => {
    removeFromCart(productId)
  }

  const handleClearCart = () => {
    clearCart()
    setShowClearCartDialog(false)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)
      // Find selected payment method to get its name
      const selectedPaymentMethod = paymentMethods.find(
        (m) => m.id === formData.payment_method
      )

      const response = await fetch(`/api/stores/${storeId}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: formData.customer_id,
          team_member_id: formData.team_member_id,
          payment_method: selectedPaymentMethod?.name || formData.payment_method,
          parcelas: formData.parcelas,
          status: formData.status,
          ...(formData.notes ? { notes: formData.notes } : {}),
          items: cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("Sale creation error:", error)
        const detailsMessage = error.details ? `\n${JSON.stringify(error.details, null, 2)}` : ""
        throw new Error((error.error || "Erro ao criar venda") + detailsMessage)
      }

      setFormData({
        team_member_id: "",
        customer_id: "",
        payment_method: "",
        parcelas: "À Vista",
        status: "Concluída",
        notes: "",
      })
      clearCart()
      setErrors({})
      setIsModalOpen(false)
      onSaleCreated?.()
    } catch (error) {
      console.error("Error creating sale:", error)
      alert(error instanceof Error ? error.message : "Erro ao criar venda")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
          <DialogDescription>
            Selecione um cliente, adicione produtos e complete a venda.
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

          {/* Cliente */}
          <div className="space-y-2 relative">
            <Label htmlFor="customer-search">Cliente *</Label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-search"
                placeholder="Buscar cliente por nome ou email..."
                value={selectedCustomer ? selectedCustomer.full_name : customerSearchQuery}
                onChange={(e) => {
                  setCustomerSearchQuery(e.target.value)
                  setShowCustomerDropdown(true)
                  if (e.target.value === "") {
                    setFormData({ ...formData, customer_id: "" })
                  }
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                disabled={loadingCustomers}
                className="pl-10"
              />
            </div>

            {/* Customer dropdown */}
            {showCustomerDropdown && customerSearchQuery && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-md z-50 mt-1 max-h-48 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, customer_id: customer.id })
                      setCustomerSearchQuery("")
                      setShowCustomerDropdown(false)
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-accent border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{customer.full_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.email}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showCustomerDropdown && customerSearchQuery && filteredCustomers.length === 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-lg shadow-md z-50 mt-1 p-3">
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum cliente encontrado
                </p>
              </div>
            )}

            {/* Selected customer badge */}
            {selectedCustomer && (
              <div className="flex items-center gap-2 p-2 bg-accent rounded">
                <Badge variant="outline">✓ {selectedCustomer.full_name}</Badge>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, customer_id: "" })
                    setCustomerSearchQuery("")
                  }}
                  className="ml-auto p-1 hover:bg-muted rounded"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            {errors.customer_id && (
              <p className="text-sm text-red-600">{errors.customer_id}</p>
            )}
          </div>

          {/* Produtos - Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "add-product" | "cart")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add-product">Adicionar Produtos</TabsTrigger>
              <TabsTrigger value="cart">
                Carrinho ({cart.length})
              </TabsTrigger>
            </TabsList>

            {/* Adicionar Produtos */}
            <TabsContent value="add-product" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="search-product">Buscar Produto</Label>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-product"
                    placeholder="Buscar por nome ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    disabled={loadingProducts}
                  />
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-2 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => setSelectedProductId(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estoque: {product.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery
                    ? "Nenhum produto encontrado"
                    : "Digite para buscar produtos"}
                </p>
              )}

              {selectedProductId && (
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        max={
                          products.find((p) => p.id === selectedProductId)
                            ?.stock || 1
                        }
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddToCart}
                      className="mt-6"
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Carrinho */}
            <TabsContent value="cart" className="space-y-3">
              {cart.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="p-2 border rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.unit_price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm min-w-20 text-right">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(item.subtotal)}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.product_id)}
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-2 mt-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Total:</p>
                        <p className="font-semibold text-lg">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowClearCartDialog(true)}
                  >
                    Limpar Carrinho
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto adicionado ao carrinho
                </p>
              )}
              {errors.cart && (
                <p className="text-sm text-red-600">{errors.cart}</p>
              )}
            </TabsContent>
          </Tabs>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment-method">Método de Pagamento *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => {
                const method = paymentMethods.find((m) => m.id === value)
                setFormData({
                  ...formData,
                  payment_method: value,
                  parcelas: method?.parcelas || "À Vista",
                })
              }}
              disabled={loadingPaymentMethods}
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Selecione um método" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center gap-2">
                      {method.codigo && (
                        <span className="font-semibold text-blue-600">{method.codigo}</span>
                      )}
                      <span>{method.name}</span>
                      <span className="text-muted-foreground">({method.parcelas})</span>
                    </div>
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

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Input
              id="notes"
              placeholder="Adicione notas sobre essa venda..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {formData.notes.length}/200
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || cart.length === 0}>
              {isLoading ? "Criando..." : `Criar Venda (${cart.length} itens)`}
            </Button>
          </div>
        </form>

        {/* Clear Cart Confirmation Modal */}
        {showClearCartDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Limpar Carrinho?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Tem certeza que deseja remover todos os {cart.length} produto(s) do carrinho? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearCartDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearCart}
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
