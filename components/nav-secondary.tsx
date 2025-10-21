"use client"

import * as React from "react"
import Link from "next/link"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Color mapping for secondary navigation items
const iconColors: Record<string, string> = {
  "Configurações": "text-slate-500",
  "Ajuda": "text-yellow-500",
  "Buscar": "text-red-500",
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton tooltip={item.title} asChild size="lg" className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0">
                <Link href={item.url}>
                  <item.icon className={`group-data-[collapsible=icon]:size-6 ${iconColors[item.title] || "text-foreground"}`} />
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
