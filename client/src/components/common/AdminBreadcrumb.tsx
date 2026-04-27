'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HomeOutlined, RightOutlined } from '@ant-design/icons'
import { cn } from '@/lib/utils'

export type AdminBreadcrumbLink = {
  label: string
} & (
  | { href: string; onClick?: never }
  | { onClick: () => void; href?: never }
)

export type AdminBreadcrumbProps = {
  className?: string
  showHomeButton?: boolean
  /** Mặc định: `/dashboard` khi bấm icon nhà bằng `Link` (nếu không dùng `onHomeClick`). */
  rootHref?: string
  onHomeClick?: () => void
  homeAriaLabel?: string
  items: AdminBreadcrumbLink[]
  currentPage: string
  /** Màu nhấn: `default` (xanh Ant), `green` cho màn dữ liệu danh mục. */
  accent?: 'default' | 'green'
  currentClassName?: string
  linkClassName?: string
  homeButtonClassName?: string
  separatorClassName?: string
}

const defaultLink =
  'rounded-lg px-2.5 py-1.5 font-medium text-slate-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677ff]/30'
const defaultLinkHover = 'hover:bg-slate-100/80 hover:text-[#1677ff]'
const greenLinkHover = 'hover:bg-emerald-50/60 hover:text-[#007f32] focus-visible:ring-[#007f32]/20'

const defaultCurrent = 'truncate px-2.5 py-1.5 font-semibold tracking-tight text-slate-900'
const defaultCurrentGreen = 'text-[#007f32]'

const homeButtonBase =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors focus:outline-none'
const defaultHomeHover =
  'hover:bg-slate-100/90 hover:text-[#1677ff] focus-visible:ring-2 focus-visible:ring-[#1677ff]/30'
const homeGreenHover =
  'hover:bg-emerald-50/50 hover:text-[#007f32] focus-visible:ring-2 focus-visible:ring-[#007f32]/20'
const defaultSep = 'inline-flex h-8 select-none items-center px-0.5 text-slate-300'
const defaultShell =
  'flex w-full min-w-0 flex-wrap items-center gap-y-1 rounded-xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 px-2 py-1.5 text-[13px] leading-none shadow-sm ring-1 ring-slate-900/[0.03]'

function Separator({ className }: { className?: string }) {
  return (
    <li className={cn(defaultSep, className)} aria-hidden>
      <RightOutlined className="text-[10px]" />
    </li>
  )
}

/**
 * Breadcrumb màn quản trị: icon trang chủ, mũi tên, các cấp bấm được, cấp hiện tại.
 */
export default function AdminBreadcrumb({
  className,
  showHomeButton = true,
  rootHref = '/dashboard',
  onHomeClick,
  homeAriaLabel = 'Bảng điều khiển',
  items,
  currentPage,
  accent = 'default',
  currentClassName,
  linkClassName,
  homeButtonClassName,
  separatorClassName,
}: AdminBreadcrumbProps) {
  const router = useRouter()
  const goRoot = onHomeClick ?? (() => router.push(rootHref))
  const useLinkForHome = onHomeClick == null && rootHref

  const isGreen = accent === 'green'
  const linkCls = cn(defaultLink, isGreen ? greenLinkHover : defaultLinkHover, linkClassName)
  const homeCls = cn(
    homeButtonBase,
    isGreen ? homeGreenHover : defaultHomeHover,
    homeButtonClassName,
  )
  const currentCls = cn(
    defaultCurrent,
    isGreen && defaultCurrentGreen,
    currentClassName,
  )
  const sepCls = separatorClassName

  return (
    <nav
      className={cn(defaultShell, className)}
      aria-label="Điều hướng trang"
    >
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-0.5 p-0">
        {showHomeButton && (
          <li className="flex items-center">
            {useLinkForHome ? (
              <Link href={rootHref} className={homeCls} aria-label={homeAriaLabel}>
                <HomeOutlined className="text-base" />
              </Link>
            ) : (
              <button type="button" onClick={goRoot} className={homeCls} aria-label={homeAriaLabel}>
                <HomeOutlined className="text-base" />
              </button>
            )}
          </li>
        )}

        {showHomeButton && (items.length > 0 || currentPage) ? <Separator className={sepCls} /> : null}

        {items.map((item, index) => (
          <Fragment key={`${'href' in item && item.href ? item.href : 'btn'}-${item.label}-${String(index)}`}>
            <li>
              {'href' in item && item.href ? (
                <Link href={item.href} className={linkCls}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick!} className={linkCls}>
                  {item.label}
                </button>
              )}
            </li>
            <Separator className={sepCls} />
          </Fragment>
        ))}

        <li className={currentCls} aria-current="page">
          {currentPage}
        </li>
      </ol>
    </nav>
  )
}
