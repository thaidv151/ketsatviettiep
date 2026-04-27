'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react'
import {
  Barcode,
  Box,
  Camera,
  Cctv,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Dumbbell,
  Gamepad2,
  Headphones,
  Laptop,
  LucideIcon,
  Monitor,
  Printer,
  Smartphone,
  Sparkles,
  Watch,
  Percent,
  Compass,
} from 'lucide-react'
import type { CategoryDto } from '@/services/category.service'
import { categoryApi } from '@/services/category.service'
import type { BannerDto } from '@/services/banner.service'
import { portalApi } from '@/services/portal.service'
import { getFullImagePath } from '@/lib/path-utils'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: LucideIcon[] = [
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Camera,
  Monitor,
  Gamepad2,
  Printer,
  Cctv,
  Dumbbell,
  Cpu,
  Barcode,
  Box,
  Sparkles,
]

function pickMainBanners(banners: BannerDto[]) {
  return banners.slice(0, Math.min(5, banners.length))
}

function pickSubBanners(banners: BannerDto[]) {
  if (banners.length <= 5) return [] as BannerDto[]
  return banners.slice(5, 8)
}

/** Khớp `id` trong `featured-products.tsx` — bấm cuộn xuống khối tương ứng. */
const HOME_PRODUCT_SECTION_IDS = ['san-pham-noi-bat', 'uu-dai', 'goi-y-them'] as const

const HOME_PRODUCT_JUMPS: {
  id: (typeof HOME_PRODUCT_SECTION_IDS)[number]
  short: string
  full: string
  icon: LucideIcon
}[] = [
  { id: 'san-pham-noi-bat', short: 'Nổi bật', full: 'Sản phẩm nổi bật', icon: Sparkles },
  { id: 'uu-dai', short: 'Ưu đãi', full: 'Ưu đãi & giảm giá', icon: Percent },
  { id: 'goi-y-them', short: 'Gợi ý', full: 'Gợi ý thêm cho bạn', icon: Compass },
]

function scrollToProductSection(preferred: (typeof HOME_PRODUCT_SECTION_IDS)[number]) {
  if (typeof document === 'undefined') return
  const order: string[] = [preferred, ...HOME_PRODUCT_SECTION_IDS.filter((x) => x !== preferred)]
  for (const id of order) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
  }
}

export default function HeroSectionClient() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [banners, setBanners] = useState<BannerDto[]>([])
  const [loading, setLoading] = useState(true)

  const mainBanners = pickMainBanners(banners)
  const subBanners = pickSubBanners(banners)
  const [active, setActive] = useState(0)
  /** Tăng khi user chọn slide — reset interval tự chuyển. */
  const [autoplayReset, setAutoplayReset] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([categoryApi.listForSelect(), portalApi.getBanners()])
      .then(([cats, bann]) => {
        if (cancelled) return
        setCategories(Array.isArray(cats) ? cats : [])
        setBanners(Array.isArray(bann) ? bann : [])
      })
      .catch(() => {
        if (!cancelled) {
          setCategories([])
          setBanners([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setActive(0)
  }, [banners.length])

  const n = mainBanners.length
  const safe = n === 0 ? 0 : active % n

  const selectSlide = useCallback((index: number) => {
    if (n < 1) return
    setActive(index % n)
    setAutoplayReset((k) => k + 1)
  }, [n])

  const AUTOPLAY_MS = 5000
  useEffect(() => {
    if (n <= 1) return
    const t = setInterval(() => {
      setActive((i) => (i + 1) % n)
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [n, autoplayReset])

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n < 1) return
      setActive((i) => {
        const next = (i + dir + n) % n
        return next
      })
      setAutoplayReset((k) => k + 1)
    },
    [n],
  )

  const touchX = useRef<number | null>(null)
  const onCarouselTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchX.current = e.touches[0].clientX
  }
  const onCarouselTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (n <= 1 || touchX.current == null) {
      touchX.current = null
      return
    }
    const endX = e.changedTouches[0].clientX
    const dx = endX - touchX.current
    const threshold = 48
    if (dx < -threshold) go(1)
    else if (dx > threshold) go(-1)
    touchX.current = null
  }

  const roots = categories
    .filter((c) => c.isActive && (c.parentId == null || c.parentId === ''))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'vi'))

  if (loading) {
    return (
      <section className="border-b border-slate-200/60 bg-slate-50/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
          <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:w-[min(20rem,26%)]">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-200/80" />
              ))}
            </div>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 sm:justify-start">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-24 animate-pulse rounded-xl bg-slate-200/80 sm:h-10 sm:w-28" />
              ))}
            </div>
            <div className="h-10 animate-pulse rounded-lg bg-slate-200/80" />
            <div className="min-h-[12rem] animate-pulse rounded-2xl bg-slate-200/70" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-slate-200/60 bg-slate-50/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        {/* Cột trái: danh mục */}
        <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 lg:w-[min(20rem,26%)]">
          <nav className="max-h-[min(24rem,70vh)] overflow-y-auto p-1.5 sm:p-2" aria-label="Danh mục sản phẩm">
            {roots.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-slate-500">Đang cập nhật danh mục</p>
            ) : (
              <ul className="space-y-0.5">
                {roots.map((c, i) => {
                  const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length]
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/san-pham?categoryId=${c.id}`}
                        className="group flex min-h-[2.5rem] items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-sm text-slate-800 transition hover:bg-slate-100"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#E53935] ring-1 ring-rose-100/80"
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" strokeWidth={2.25} />
                          </span>
                          <span className="truncate font-medium group-hover:font-semibold">{c.name}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </nav>
        </aside>

        {/* Cột phải: mục sản phẩm bên dưới + tabs + carousel + sub */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm shadow-slate-200/40 sm:p-2.5"
            aria-label="Xem nhanh cửa hàng phía dưới"
          >
            <p className="mb-2 border-b border-slate-100 px-0.5 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 sm:text-xs">
              Tới khối sản phẩm
            </p>
            <div className="flex min-w-0 flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
              {HOME_PRODUCT_JUMPS.map(({ id, short, full, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToProductSection(id)}
                  title={full}
                  className="inline-flex min-h-9 min-w-0 max-w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/90 px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/90 hover:text-[#B71C1C] sm:px-3 sm:py-2 sm:text-sm"
                >
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-rose-600/90 sm:h-4 sm:w-4"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                  <span className="truncate">{short}</span>
                </button>
              ))}
            </div>
          </div>

          {n > 0 && (
            <div
              className="flex min-w-0 flex-wrap border-b border-slate-200/60 bg-slate-100/30 sm:flex-nowrap"
              role="tablist"
            >
              {mainBanners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safe}
                  onClick={() => selectSlide(i)}
                  className={cn(
                    'min-w-0 flex-1 border-b-2 border-transparent px-2 py-2.5 text-left transition sm:px-3',
                    i === safe
                      ? 'border-[#E53935] bg-white'
                      : 'hover:bg-slate-50/80',
                  )}
                >
                  <div className="line-clamp-2 text-[10px] font-extrabold uppercase leading-tight tracking-wide text-slate-900 sm:text-xs">
                    {b.title}
                  </div>
                  {b.description ? (
                    <div className="mt-0.5 line-clamp-1 text-[10px] text-slate-500 sm:text-[11px]">{b.description}</div>
                  ) : null}
                </button>
              ))}
            </div>
          )}

          {n > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div
                className="relative aspect-[21/9] min-h-[9rem] w-full touch-pan-y sm:min-h-[11.5rem]"
                aria-roledescription="carousel"
                aria-label="Ảnh quảng cáo"
                onTouchStart={onCarouselTouchStart}
                onTouchEnd={onCarouselTouchEnd}
              >
                <div
                  className="flex h-full w-full will-change-transform transition-transform duration-700 ease-in-out motion-reduce:duration-0 motion-reduce:transition-none"
                  style={{
                    width: `${n * 100}%`,
                    transform: `translateX(-${(safe * 100) / n}%)`,
                  }}
                >
                  {mainBanners.map((b) => (
                    <div
                      key={b.id}
                      className="relative h-full shrink-0"
                      style={{ width: `${100 / n}%` }}
                    >
                      {b.linkUrl ? (
                        <a href={b.linkUrl} className="block h-full w-full" aria-label={b.title}>
                          <img
                            src={getFullImagePath(b.imageUrl)}
                            alt={b.title}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        </a>
                      ) : (
                        <img
                          src={getFullImagePath(b.imageUrl)}
                          alt={b.title}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {n > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Ảnh trước"
                      onClick={() => go(-1)}
                      className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/35 text-white backdrop-blur-sm transition hover:bg-slate-900/50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Ảnh sau"
                      onClick={() => go(1)}
                      className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/35 text-white backdrop-blur-sm transition hover:bg-slate-900/50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div
                      className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-slate-900/25 px-2 py-1.5 backdrop-blur-sm"
                      role="group"
                      aria-label="Vị trí ảnh banner"
                    >
                      {mainBanners.map((b, i) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => selectSlide(i)}
                          aria-label={`Slide ${i + 1}: ${b.title}`}
                          aria-current={i === safe ? 'true' : undefined}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                            i === safe
                              ? 'w-5 bg-white shadow-sm'
                              : 'w-1.5 bg-white/50 hover:bg-white/75',
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {n === 0 && (
            <div className="flex min-h-[10rem] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center text-sm text-slate-500">
              Chưa có banner — hãy thêm banner tại trang quản trị.
            </div>
          )}

          {subBanners.length > 0 && (
            <div className="grid grid-cols-1 gap-3 min-[500px]:grid-cols-3">
              {subBanners.map((b) => {
                const inner = (
                  <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="relative aspect-[16/9] w-full min-h-[5.5rem]">
                      <img
                        src={getFullImagePath(b.imageUrl)}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="border-t border-slate-100 px-2.5 py-1.5">
                      <p className="line-clamp-1 text-xs font-bold text-slate-800">{b.title}</p>
                    </div>
                  </div>
                )
                return b.linkUrl ? (
                  <a key={b.id} href={b.linkUrl} className="block transition hover:opacity-95">
                    {inner}
                  </a>
                ) : (
                  <div key={b.id}>{inner}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
