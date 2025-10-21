"use client"

import React, { createContext, useContext, useState } from "react"

export type CartItem = {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  total: number
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
  defaultTab: "add-product" | "cart"
  setDefaultTab: (tab: "add-product" | "cart") => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState<"add-product" | "cart">("add-product")

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => [...prevCart, item])
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        total,
        isModalOpen,
        setIsModalOpen,
        defaultTab,
        setDefaultTab,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
