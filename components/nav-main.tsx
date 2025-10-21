"use client"

import * as React from "react"
import Link from "next/link"
import { IconPlus, IconShoppingCart, type Icon } from "@tabler/icons-react"
import { useSelectedStoreId } from "@/hooks/use-store"
import { useCart } from "@/contexts/cart-context"

import { Button } from "@/components/ui/button"
import { NewSaleDialog } from "@/components/new-sale-dialog"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const storeId = useSelectedStoreId()
  const { setIsModalOpen, setDefaultTab, cart } = useCart()

  if (!storeId) return null

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenuItem className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton
              onClick={() => {
                setDefaultTab("add-product")
                setIsModalOpen(true)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-20 duration-200 ease-linear"
            >
              <IconPlus />
              <span>Nova Venda</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 relative"
              variant="outline"
              onClick={() => {
                setDefaultTab("cart")
                setIsModalOpen(true)
              }}
            >
              <IconShoppingCart />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
              <span className="sr-only">Carrinho ({cart.length})</span>
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center w-full px-2">
            <SidebarMenuButton
              onClick={() => {
                setDefaultTab("add-product")
                setIsModalOpen(true)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground w-full px-0 h-10"
            >
              <IconPlus className="size-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NewSaleDialog storeId={storeId} />
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton tooltip={item.title} asChild size="lg" className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0">
                <Link href={item.url}>
                  {item.icon && <item.icon className="group-data-[collapsible=icon]:size-6" />}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
