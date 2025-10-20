import { ReactNode, Suspense } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { StoreProvider } from '@/contexts/store-context'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <SiteHeader />
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </StoreProvider>
  )
}


