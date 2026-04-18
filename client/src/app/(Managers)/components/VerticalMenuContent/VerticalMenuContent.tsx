'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import type { AdminNavItem } from '../../config/adminNav.types'
import VerticalMenuIcon from './VerticalMenuIcon'

export interface VerticalMenuContentProps {
  /** Cây menu — mảng các mục (có thể lồng một cấp `children` với các lá có `href`). */
  items: AdminNavItem[]
  /** Nhãn nhóm phía trên danh sách (tuỳ chọn). */
  sectionLabel?: string
  className?: string
}

function pathIsUnder(pathname: string, href: string): boolean {
  if (pathname === href) return true
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true
  return false
}

function subtreeMatches(pathname: string, item: AdminNavItem): boolean {
  if (item.href && pathIsUnder(pathname, item.href)) return true
  if (item.children?.length) {
    return item.children.some((c) => subtreeMatches(pathname, c))
  }
  return false
}

function SubLeaves({ items, pathname }: { items: AdminNavItem[]; pathname: string }) {
  return (
    <>
      {items.map((child) => {
        if (!child.href) return null
        const subActive = pathIsUnder(pathname, child.href)
        return (
          <SidebarMenuSubItem key={child.id}>
            <SidebarMenuSubButton
              asChild
              isActive={subActive}
              className={cn(
                'rounded-lg text-sm transition-all duration-150',
                subActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <Link href={child.href}>
                <VerticalMenuIcon name={child.icon} />
                <span>{child.name}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        )
      })}
    </>
  )
}

function NavItems({ items, pathname }: { items: AdminNavItem[]; pathname: string }) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length)

        if (hasChildren) {
          const open = subtreeMatches(pathname, item)
          return (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={open}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.name}
                    className={cn(
                      'rounded-lg font-medium transition-all duration-150',
                      open
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    )}
                  >
                    <VerticalMenuIcon name={item.icon} />
                    <span>{item.name}</span>
                    <ChevronRight
                      className={cn(
                        'ml-auto size-4 shrink-0 transition-transform duration-200',
                        'group-data-[state=open]/collapsible:rotate-90',
                      )}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="border-sidebar-accent/30 ml-3 border-l pl-3">
                    <SubLeaves items={item.children!} pathname={pathname} />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        if (item.href) {
          const active = pathIsUnder(pathname, item.href)
          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.name}
                className={cn(
                  'rounded-lg font-medium transition-all duration-150',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Link href={item.href}>
                  <VerticalMenuIcon name={item.icon} />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        }

        return (
          <SidebarMenuItem key={item.id}>
            <span className="text-sidebar-foreground/40 pointer-events-none px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase">
              {item.name}
            </span>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}

export default function VerticalMenuContent({
  items,
  sectionLabel,
  className,
}: VerticalMenuContentProps) {
  const pathname = usePathname() ?? '/'

  return (
    <SidebarGroup className={cn('px-0', className)}>
      {sectionLabel ? (
        <SidebarGroupLabel className="text-sidebar-foreground/80 px-2">
          {sectionLabel}
        </SidebarGroupLabel>
      ) : null}
      <SidebarGroupContent>
        <SidebarMenu>
          <NavItems items={items} pathname={pathname} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
