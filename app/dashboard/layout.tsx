import { ReactNode, Suspense } from 'react'
import { Separator } from '@/components/ui/separator'
import { StoreSelector } from '@/components/store-selector'
import { SidebarNav } from '@/components/sidebar-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { SelectedStoreInfo } from '@/components/selected-store-info'
import { StoreProvider } from '@/contexts/store-context'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
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
            <div className="flex flex-col gap-1">
              <Breadcrumbs />
              <SelectedStoreInfo />
            </div>
            <ThemeToggle />
          </header>
          {children}
        </section>
      </div>
    </StoreProvider>
  )
}


