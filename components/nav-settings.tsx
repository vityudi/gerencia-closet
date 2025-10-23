"use client"

import * as React from "react"
import Link from "next/link"
import { type Icon, IconChevronDown, IconSettings } from "@tabler/icons-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface SettingsItem {
  title: string
  url: string
  icon?: Icon
}

interface SettingsGroup {
  title: string
  url: string
  icon: Icon
  items: SettingsItem[]
}

const settingsGroups: SettingsGroup[] = [
  {
    title: "Configurações",
    url: "/dashboard/settings",
    icon: IconSettings,
    items: [
      {
        title: "Métodos de Pagamento",
        url: "/dashboard/settings/payment-methods",
      },
      // Add more settings items here in the future
      // {
      //   title: "Integrações",
      //   url: "/dashboard/settings/integrations",
      // },
      // {
      //   title: "Notificações",
      //   url: "/dashboard/settings/notifications",
      // },
    ],
  },
]

export function NavSettings() {
  const pathname = usePathname()
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

  const toggleGroup = (groupTitle: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }))
  }

  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          {settingsGroups.map((group) => {
            const isOpen = openItems[group.title] ?? false
            const GroupIcon = group.icon

            return (
              <Collapsible
                key={group.title}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.title)}
                className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
              >
                <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={group.title}
                      className="group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0"
                      size="lg"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <IconChevronDown className="transition-transform duration-200 h-4 w-4 group-data-[collapsible=icon]:hidden" />
                        <GroupIcon className="text-slate-500 group-data-[collapsible=icon]:size-6" />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {group.title}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="CollapsibleContent group-data-[collapsible=icon]:hidden">
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
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
