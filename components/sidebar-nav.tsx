"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, MessageCircle, Package, Users, ShoppingCart, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Visão geral', icon: Home, color: 'text-blue-600' },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle, color: 'text-emerald-600' },
  { href: '/dashboard/products', label: 'Produtos', icon: Package, color: 'text-purple-600' },
  { href: '/dashboard/customers', label: 'Clientes', icon: Users, color: 'text-rose-600' },
  { href: '/dashboard/sales', label: 'Vendas', icon: ShoppingCart, color: 'text-amber-600' },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings, color: 'text-slate-600' },
]

export function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="grid gap-1 text-sm">
      {items.map(({ href, label, icon: Icon, color }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={cn(
            'flex items-center gap-2 rounded px-2 py-1 hover:bg-muted',
            active && 'bg-muted font-medium'
          )}>
            <Icon className={cn('h-4 w-4', color)} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}


