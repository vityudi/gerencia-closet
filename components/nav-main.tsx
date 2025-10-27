"use client"

import * as React from "react"
import Link from "next/link"
import { IconPlus, IconShoppingCart, IconChevronDown, type Icon } from "@tabler/icons-react"
import { useSelectedStoreId } from "@/hooks/use-store"
import { useCart } from "@/contexts/cart-context"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { NewSaleDialog } from "@/components/new-sale-dialog"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Color mapping for navigation items
const iconColors: Record<string, string> = {
  "Dashboard": "text-blue-500",
  "Chat": "text-purple-500",
  "Produtos": "text-orange-500",
  "Clientes": "text-pink-500",
  "Vendas": "text-green-500",
  "Equipe": "text-cyan-500",
  "Configurações": "text-slate-500",
  "Ajuda": "text-yellow-500",
  "Buscar": "text-red-500",
  "Relatórios": "text-indigo-500",
  "Análises": "text-emerald-500",
}

// Reusable NavButton component
function NavButton({ title, url, icon: Icon }: { title: string; url: string; icon?: Icon }) {
  return (
    <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
      <SidebarMenuButton tooltip={title} asChild size="lg" className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 w-full">
        <Link href={url}>
          <div className="flex items-center gap-2 flex-1">
            {Icon && <Icon className={`group-data-[collapsible=icon]:size-6 ${iconColors[title] || "text-foreground"}`} />}
            <span className="group-data-[collapsible=icon]:hidden">{title}</span>
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface NavItem {
  title: string
  url: string
  icon?: Icon
}

interface NavGroup {
  title: string
  url: string
  icon: Icon
  items: NavItem[]
}

export function NavMain({
  items = [],
  documents = [],
  secondary = [],
  settings = [],
}: {
  items?: NavItem[]
  documents?: NavItem[]
  secondary?: NavItem[]
  settings?: NavGroup[]
} = {}) {
  const storeId = useSelectedStoreId()
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const { setIsModalOpen, setDefaultTab, cart } = useCart()
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({})

  // Auto-expand settings group if any subpage is active
  React.useEffect(() => {
    const isSettingsPage = pathname.startsWith("/dashboard/settings")
    if (isSettingsPage) {
      setOpenItems((prev) => ({
        ...prev,
        Configurações: true,
      }))
    }
  }, [pathname])

  if (!storeId) return null

  const toggleGroup = (groupTitle: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

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
            <NavButton key={item.title} {...item} />
          ))}
        </SidebarMenu>

        {/* Documents Section */}
        {documents.length > 0 && (
          <SidebarMenu>
            {documents.map((item) => (
              <NavButton key={item.url} {...item} />
            ))}
          </SidebarMenu>
        )}

        {/* Secondary Navigation */}
        {secondary.length > 0 && (
          <SidebarMenu>
            {secondary.map((item) => (
              <NavButton key={item.title} {...item} />
            ))}
          </SidebarMenu>
        )}

        {/* Settings Section with Collapsible Groups */}
        {settings.length > 0 && (
          <SidebarMenu>
            {settings.map((group) => {
              const isOpen = openItems[group.title] ?? false
              const GroupIcon = group.icon

              return (
                <Collapsible
                  key={group.title}
                  open={isOpen}
                  onOpenChange={() => toggleGroup(group.title)}
                  className="group/collapsible w-full"
                >
                  <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.title}
                        className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 w-full [&[data-state=open]_svg:last-child]:rotate-180"
                        size="lg"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <GroupIcon className="text-slate-500 group-data-[collapsible=icon]:size-6" />
                          <span className="group-data-[collapsible=icon]:hidden">
                            {group.title}
                          </span>
                        </div>
                        <IconChevronDown className="transition-transform duration-200 h-4 w-4 group-data-[collapsible=icon]:hidden ml-auto" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="CollapsibleContent group-data-[collapsible=icon]:hidden w-full">
                      <SidebarMenuSub>
                        {group.items.map((item) => (
                          <SidebarMenuSubItem key={item.url}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === item.url}
                            >
                              <Link href={item.url}>{item.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            })}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
