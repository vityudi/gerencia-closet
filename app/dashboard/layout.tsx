import { ReactNode, Suspense } from 'react'
import { Separator } from '@/components/ui/separator'
import { StoreSelector } from '@/components/store-selector'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Breadcrumbs } from '@/components/breadcrumbs'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r p-4 space-y-3">
        <h2 className="text-lg font-semibold">Admin</h2>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <Suspense fallback={<div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />}>
            <StoreSelector />
          </Suspense>
        </div>
        <SidebarNav />
      </aside>
      <section>
        <header className="flex items-center justify-between p-4 border-b">
          <Breadcrumbs />
          <ThemeToggle />
        </header>
        {children}
      </section>
    </div>
  )
}


