'use client'

import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import VerticalMenuContent from './components/VerticalMenuContent'
import {
  adminNavConfig,
  adminNavItems,
} from './config/adminNavConfig'
import type { AdminNavItem } from './config/adminNav.types'
import { useAuth } from '@/stores/authStore'

export type ManagersShellProps = {
  children: ReactNode
  /** Mảng menu — mặc định lấy từ `adminNavConfig.items`. */
  navItems?: AdminNavItem[]
  /** Tiêu đề trên sidebar (mặc định từ config). */
  sidebarTitle?: string
  /** Nhãn nhóm menu (mặc định từ config). */
  sectionLabel?: string
}

export default function ManagersShell({
  children,
  navItems,
  sidebarTitle = adminNavConfig.sidebarTitle,
  sectionLabel = adminNavConfig.sectionLabel,
}: ManagersShellProps) {
  const { UserInfo } = useAuth()
  const finalItems = navItems || UserInfo?.menuItems || adminNavItems
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="border-sidebar-border gap-0 border-b px-4 py-3">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <div className="bg-sidebar-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
              <span className="text-sidebar-primary-foreground text-xs font-bold">KV</span>
            </div>
            <span className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:sr-only">
              {sidebarTitle}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-2">
          <VerticalMenuContent items={finalItems} sectionLabel={sectionLabel} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 shadow-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <span className="text-muted-foreground text-sm font-medium">{sidebarTitle}</span>
        </header>
        <div className="bg-muted/30 flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
