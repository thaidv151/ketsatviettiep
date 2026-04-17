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
            <SidebarMenuSubButton asChild isActive={subActive}>
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
                  <SidebarMenuButton tooltip={item.name}>
                    <VerticalMenuIcon name={item.icon} />
                    <span>{item.name}</span>
                    <ChevronRight
                      className={cn(
                        'ml-auto size-4 shrink-0 transition-transform',
                        'group-data-[state=open]/collapsible:rotate-90',
                      )}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
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
              <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
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
            <span className="text-muted-foreground pointer-events-none px-2 py-1.5 text-xs font-semibold tracking-wide uppercase">
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
