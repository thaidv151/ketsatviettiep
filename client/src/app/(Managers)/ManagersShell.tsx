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
  navItems = adminNavItems,
  sidebarTitle = adminNavConfig.sidebarTitle,
  sectionLabel = adminNavConfig.sectionLabel,
}: ManagersShellProps) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="border-sidebar-border gap-2 border-b px-3 py-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <span className="truncate font-semibold group-data-[collapsible=icon]:sr-only">
              {sidebarTitle}
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <VerticalMenuContent items={navItems} sectionLabel={sectionLabel} />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <span className="text-muted-foreground text-sm">{sidebarTitle}</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
