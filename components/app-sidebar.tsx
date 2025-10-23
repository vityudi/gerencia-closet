"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessageCircle,
  IconPackage,
  IconReport,
  IconSearch,
  IconShoppingCart,
  IconUsers,
  IconUserCheck,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavSettings } from "@/components/nav-settings"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@gerencia-closet.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: IconMessageCircle,
    },
    {
      title: "Produtos",
      url: "/dashboard/products",
      icon: IconPackage,
    },
    {
      title: "Clientes",
      url: "/dashboard/customers",
      icon: IconUsers,
    },
    {
      title: "Vendas",
      url: "/dashboard/sales",
      icon: IconShoppingCart,
    },
    {
      title: "Equipe",
      url: "/dashboard/team",
      icon: IconUserCheck,
    },
  ],
  navClouds: [
    {
      title: "Análises",
      icon: IconChartBar,
      isActive: true,
      url: "/dashboard/analytics",
      items: [
        {
          title: "Relatórios de Vendas",
          url: "/dashboard/sales",
        },
        {
          title: "Métricas de Produtos",
          url: "/dashboard/products",
        },
      ],
    },
    {
      title: "Gestão",
      icon: IconListDetails,
      url: "/dashboard/management",
      items: [
        {
          title: "Estoque",
          url: "/dashboard/products",
        },
        {
          title: "Clientes",
          url: "/dashboard/customers",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Ajuda",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "/dashboard/search",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Relatórios",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Análises",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar 
      collapsible="icon" 
      className="group-data-[collapsible=icon]:w-16"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-2"
              size="lg"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5 group-data-[collapsible=icon]:!size-6" />
                <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">Gerencia Closet</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSettings />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
