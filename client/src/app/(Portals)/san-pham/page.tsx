'use client'

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  type MouseEvent,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, ChevronDown, Loader2, Package } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { portalApi, type PortalProductDto } from '@/services/portal.service'
import { categoryApi } from '@/services/category.service'
import { getFullImagePath } from '@/lib/path-utils'
import { cn } from '@/lib/utils'
import { RevealOnScroll } from '@/components/reveal-on-scroll'

const BATCH = 20
const INFINITE_COOLDOWN_MS = 500

type SortId = 'popular' | 'newest' | 'price-low' | 'price-high'

function sortProducts(list: PortalProductDto[], sortBy: SortId): PortalProductDto[] {
  const out = [...list]
  if (sortBy === 'price-low') {
    out.sort((a, b) => (a.salePrice ?? a.basePrice ?? 0) - (b.salePrice ?? b.basePrice ?? 0))
  } else if (sortBy === 'price-high') {
    out.sort((a, b) => (b.salePrice ?? b.basePrice ?? 0) - (a.salePrice ?? a.basePrice ?? 0))
  } else if (sortBy === 'newest') {
    out.reverse()
  } else {
    out.sort((a, b) => {
      const f = (p: PortalProductDto) => (p.isFeatured ? 1 : 0)
      const d = f(b) - f(a)
      if (d !== 0) return d
      return a.name.localeCompare(b.name, 'vi')
    })
  }
  return out
}

function groupByCategory(list: PortalProductDto[]): [string, PortalProductDto[]][] {
  const m = new Map<string, PortalProductDto[]>()
  for (const p of list) {
    const k = p.categoryName?.trim() || 'Khác'
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(p)
  }
  return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], 'vi', { sensitivity: 'base' }))
}

function SanPhamPageInner() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<PortalProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])

  const [sortBy, setSortBy] = useState<SortId>('popular')
  const [priceRange, setPriceRange] = useState([0, 100_000_000])
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const [urlCategoryApplied, setUrlCategoryApplied] = useState(false)

  const { toast } = useToast()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const coolDownRef = useRef(false)
  const firstFilter = useRef(true)

  const categoryOptions = useMemo(() => {
    const s = new Set<string>()
    for (const p of products) s.add(p.categoryName?.trim() || 'Khác')
    return ['Tất cả', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'vi'))]
  }, [products])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await portalApi.getProducts()
      setProducts(Array.isArray(data) ? data : [])
      const w = localStorage.getItem('ketsat_wishlist')
      if (w) setWishlist(JSON.parse(w) as string[])
    } catch (e) {
      console.error('Failed to fetch products:', e)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const id = searchParams.get('categoryId')
    if (!id) {
      setUrlCategoryApplied(true)
      return
    }
    let cancel = false
    void (async () => {
      try {
        const list = await categoryApi.listForSelect()
        if (cancel) return
        const c = list.find((x) => x.id === id)
        if (c?.name) setSelectedCategory(c.name)
      } catch {
        // ignore
      } finally {
        if (!cancel) setUrlCategoryApplied(true)
      }
    })()
    return () => {
      cancel = true
    }
  }, [searchParams])

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const price = product.salePrice ?? product.basePrice ?? 0
      const inPrice = price >= priceRange[0] && price <= priceRange[1]
      const name = product.categoryName?.trim() || 'Khác'
      const inCat = selectedCategory === 'Tất cả' || name === selectedCategory
      return inPrice && inCat
    })
    return sortProducts(filtered, sortBy)
  }, [products, sortBy, priceRange, selectedCategory])

  const displayedProducts = useMemo(
    () => filteredAndSortedProducts.slice(0, visibleCount),
    [filteredAndSortedProducts, visibleCount],
  )

  /** Chia theo danh mục chỉ khi đang lọc một danh mục; "Tất cả" = một lưới phẳng. */
  const categorySections = useMemo((): [string, PortalProductDto[]][] | null => {
    if (selectedCategory === 'Tất cả') return null
    return groupByCategory(displayedProducts)
  }, [selectedCategory, displayedProducts])
  const hasMore = filteredAndSortedProducts.length > visibleCount

  useEffect(() => {
    if (!urlCategoryApplied) return
    if (firstFilter.current) {
      firstFilter.current = false
      return
    }
    setVisibleCount(BATCH)
  }, [selectedCategory, priceRange, sortBy, urlCategoryApplied])

  const toggleWishlist = (e: MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const next = [...wishlist]
    const i = next.indexOf(productId)
    if (i > -1) {
      next.splice(i, 1)
      toast({ variant: 'default', title: 'Đã xóa khỏi yêu thích' })
    } else {
      next.push(productId)
      toast({ variant: 'success', title: 'Đã thêm vào yêu thích' })
    }
    setWishlist(next)
    localStorage.setItem('ketsat_wishlist', JSON.stringify(next))
  }

  const addToCart = (e: MouseEvent, product: PortalProductDto) => {
    e.preventDefault()
    e.stopPropagation()
    const raw = localStorage.getItem('ketsat_cart')
    let cart: import('@/types/cart').CartLine[] = []
    if (raw) {
      try {
        cart = JSON.parse(raw) as typeof cart
      } catch {
        cart = []
      }
    }
    const lineKey = `${product.id}::`
    const j = cart.findIndex((c) => `${c.id}::${c.variantId ?? ''}` === lineKey)
    if (j > -1) cart[j] = { ...cart[j], quantity: cart[j].quantity + 1 }
    else
      cart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.salePrice ?? product.basePrice ?? 0,
        quantity: 1,
        image: product.thumbnailUrl,
        category: product.categoryName,
        variantId: null,
        variantLabel: null,
      })
    localStorage.setItem('ketsat_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast({ variant: 'success', title: 'Đã thêm vào giỏ hàng' })
  }

  const loadMore = useCallback(() => {
    if (coolDownRef.current) return
    if (!hasMore) return
    coolDownRef.current = true
    setVisibleCount((p) => p + BATCH)
    setTimeout(() => {
      coolDownRef.current = false
    }, INFINITE_COOLDOWN_MS)
  }, [hasMore])

  useEffect(() => {
    if (!loadMoreRef.current) return
    if (!hasMore) return
    const el = loadMoreRef.current
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) loadMore()
        }
      },
      { root: null, rootMargin: '240px 0px', threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore, hasMore, visibleCount, displayedProducts.length])

  if (!urlCategoryApplied && searchParams.get('categoryId')) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 bg-slate-50/80">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        <p className="text-sm text-slate-500">Đang áp dụng bộ lọc danh mục…</p>
      </div>
    )
  }

  return (
    <main>
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tất cả sản phẩm
          </h1>
          <p className="mt-2 text-slate-600">
            Tìm thấy <strong className="tabular-nums text-slate-800">{filteredAndSortedProducts.length}</strong>{' '}
            sản phẩm
            {selectedCategory !== 'Tất cả' && (
              <span className="text-slate-500"> · Danh mục: {selectedCategory}</span>
            )}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-500">Khoảng giá (tối đa)</h2>
              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={100_000_000}
                  step={100_000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                  className="h-2 w-full cursor-pointer accent-[#1677ff]"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0₫</span>
                  <span className="font-semibold tabular-nums text-slate-700">
                    {priceRange[1].toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-widest text-slate-500">Danh mục</h2>
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {categoryOptions.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-800">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="h-4 w-4 accent-[#1677ff]"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Hiển thị <span className="font-semibold tabular-nums">{displayedProducts.length}</span> /{' '}
                <span className="font-semibold tabular-nums">{filteredAndSortedProducts.length}</span> sản phẩm
                {categorySections != null && categorySections.length > 1 && (
                  <span className="ml-1 text-slate-500">· {categorySections.length} nhóm danh mục</span>
                )}
              </p>
              <div className="relative min-w-[200px] self-start sm:self-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortId)}
                  className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-10 text-sm font-medium text-slate-800 shadow-sm"
                >
                  <option value="popular">Nổi bật &amp; tên (A–Z)</option>
                  <option value="newest">Mới ở cuối danh sách (API)</option>
                  <option value="price-low">Giá: thấp → cao</option>
                  <option value="price-high">Giá: cao → thấp</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="h-10 w-10 animate-spin text-[#1677ff]" />
                <p className="text-sm text-slate-500">Đang tải sản phẩm…</p>
              </div>
            )}

            {!loading && displayedProducts.length > 0 && (
              <div className="space-y-12">
                {categorySections === null ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {displayedProducts.map((product, j) => {
                      const stagger = Math.min(j * 40, 400)
                      return (
                        <RevealOnScroll key={product.id} delayMs={stagger}>
                          <div className="group/p flex h-full flex-col">
                            <Card
                              className={cn(
                                'flex h-full flex-col overflow-hidden border-slate-200/90 bg-white transition-all duration-300',
                                'hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60',
                              )}
                            >
                              <Link
                                href={`/san-pham/${encodeURIComponent(product.slug || product.id)}`}
                                className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677ff]/30"
                              >
                                <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100/90 to-slate-50/50 p-3">
                                  {product.thumbnailUrl ? (
                                    <img
                                      src={getFullImagePath(product.thumbnailUrl)}
                                      alt={product.name}
                                      className="h-full w-full object-contain transition duration-500 group-hover/p:scale-[1.05]"
                                    />
                                  ) : (
                                    <div className="text-slate-300">
                                      <Package className="h-16 w-16" strokeWidth={1.25} />
                                    </div>
                                  )}
                                  {product.isFeatured && (
                                    <span className="absolute right-2 top-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                      Nổi bật
                                    </span>
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#1677ff] to-sky-400 transition group-hover/p:scale-x-100" />
                                </div>
                                <div className="p-4 pb-0">
                                  <p className="text-xs font-medium text-slate-500">
                                    {product.categoryName || 'Sản phẩm'}
                                  </p>
                                  <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-slate-900 group-hover/p:text-[#1677ff]">
                                    {product.name}
                                  </h3>
                                  <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                    <span className="text-lg font-extrabold tabular-nums text-slate-900">
                                      {product.salePrice != null
                                        ? product.salePrice.toLocaleString('vi-VN')
                                        : product.basePrice != null
                                          ? product.basePrice.toLocaleString('vi-VN')
                                          : 'Liên hệ'}
                                      {product.salePrice != null || product.basePrice != null ? '₫' : ''}
                                    </span>
                                    {product.salePrice != null &&
                                      product.basePrice != null &&
                                      product.salePrice < product.basePrice && (
                                        <span className="text-sm text-slate-400 line-through">
                                          {product.basePrice.toLocaleString('vi-VN')}₫
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </Link>
                              <div className="mt-auto space-y-2 p-4 pt-3">
                                <button
                                  type="button"
                                  onClick={(e) => toggleWishlist(e, product.id)}
                                  className="w-full rounded-lg border border-slate-200/90 bg-slate-50/80 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <span className="inline-flex items-center justify-center gap-1.5">
                                    <Heart
                                      className={cn(
                                        'h-4 w-4',
                                        wishlist.includes(product.id) && 'fill-rose-500 text-rose-500',
                                      )}
                                    />
                                    {wishlist.includes(product.id) ? 'Đã yêu thích' : 'Yêu thích'}
                                  </span>
                                </button>
                                <Button
                                  type="button"
                                  onClick={(e) => addToCart(e, product)}
                                  className="h-9 w-full gap-2 font-bold"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Thêm vào giỏ
                                </Button>
                              </div>
                            </Card>
                          </div>
                        </RevealOnScroll>
                      )
                    })}
                  </div>
                ) : (
                categorySections.map(([catName, items], gIdx) => (
                  <section
                    key={catName}
                    className="scroll-mt-24"
                    aria-labelledby={`sec-${catName.replace(/[^a-zA-Z0-9-_]/g, '-')}`}
                  >
                    {categorySections.length > 1 && (
                      <RevealOnScroll>
                        <h2
                          id={`sec-${catName.replace(/[^a-zA-Z0-9-_]/g, '-')}`}
                          className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 text-lg font-extrabold text-slate-800"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#1677ff]" />
                          {catName}
                          <span className="text-sm font-normal text-slate-500">({items.length})</span>
                        </h2>
                      </RevealOnScroll>
                    )}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {items.map((product, j) => {
                        const stagger = Math.min((gIdx * 4 + j) * 40, 400)
                        return (
                          <RevealOnScroll key={product.id} delayMs={stagger}>
                            <div className="group/p flex h-full flex-col">
                              <Card
                                className={cn(
                                  'flex h-full flex-col overflow-hidden border-slate-200/90 bg-white transition-all duration-300',
                                  'hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60',
                                )}
                              >
                                <Link
                                  href={`/san-pham/${encodeURIComponent(product.slug || product.id)}`}
                                  className="block flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1677ff]/30"
                                >
                                  <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100/90 to-slate-50/50 p-3">
                                    {product.thumbnailUrl ? (
                                      <img
                                        src={getFullImagePath(product.thumbnailUrl)}
                                        alt={product.name}
                                        className="h-full w-full object-contain transition duration-500 group-hover/p:scale-[1.05]"
                                      />
                                    ) : (
                                      <div className="text-slate-300">
                                        <Package className="h-16 w-16" strokeWidth={1.25} />
                                      </div>
                                    )}
                                    {product.isFeatured && (
                                      <span className="absolute right-2 top-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                        Nổi bật
                                      </span>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[#1677ff] to-sky-400 transition group-hover/p:scale-x-100" />
                                  </div>
                                  <div className="p-4 pb-0">
                                    <p className="text-xs font-medium text-slate-500">
                                      {product.categoryName || 'Sản phẩm'}
                                    </p>
                                    <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-slate-900 group-hover/p:text-[#1677ff]">
                                      {product.name}
                                    </h3>
                                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                      <span className="text-lg font-extrabold tabular-nums text-slate-900">
                                        {product.salePrice != null
                                          ? product.salePrice.toLocaleString('vi-VN')
                                          : product.basePrice != null
                                            ? product.basePrice.toLocaleString('vi-VN')
                                            : 'Liên hệ'}
                                        {product.salePrice != null || product.basePrice != null ? '₫' : ''}
                                      </span>
                                      {product.salePrice != null &&
                                        product.basePrice != null &&
                                        product.salePrice < product.basePrice && (
                                          <span className="text-sm text-slate-400 line-through">
                                            {product.basePrice.toLocaleString('vi-VN')}₫
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </Link>
                                <div className="mt-auto space-y-2 p-4 pt-3">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleWishlist(e, product.id)}
                                    className="w-full rounded-lg border border-slate-200/90 bg-slate-50/80 py-2 text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <span className="inline-flex items-center justify-center gap-1.5">
                                      <Heart
                                        className={cn(
                                          'h-4 w-4',
                                          wishlist.includes(product.id) && 'fill-rose-500 text-rose-500',
                                        )}
                                      />
                                      {wishlist.includes(product.id) ? 'Đã yêu thích' : 'Yêu thích'}
                                    </span>
                                  </button>
                                  <Button
                                    type="button"
                                    onClick={(e) => addToCart(e, product)}
                                    className="h-9 w-full gap-2 font-bold"
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                    Thêm vào giỏ
                                  </Button>
                                </div>
                              </Card>
                            </div>
                          </RevealOnScroll>
                        )
                      })}
                    </div>
                  </section>
                )))
                }

                {hasMore && (
                  <div
                    ref={loadMoreRef}
                    className="flex flex-col items-center justify-center py-6"
                    aria-hidden
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    <p className="mt-1 text-xs text-slate-400">Cuộn xuống để tải thêm…</p>
                  </div>
                )}

                {hasMore && (
                  <div className="mt-2 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMore}
                      className="h-10 rounded-lg border-2 font-bold uppercase tracking-wider"
                    >
                      Xem thêm {BATCH} sản phẩm
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!loading && displayedProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                <p className="text-slate-600">Không có sản phẩm phù hợp. Thử bỏ bộ lọc danh mục hoặc tăng khoảng giá.</p>
                <Button
                  type="button"
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setSelectedCategory('Tất cả')
                    setPriceRange([0, 100_000_000])
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function SanPhamFallback() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-slate-50/50">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      <p className="text-sm text-slate-500">Đang mở trang sản phẩm…</p>
    </div>
  )
}

export default function SanPhamPage() {
  return (
    <Suspense fallback={<SanPhamFallback />}>
      <SanPhamPageInner />
    </Suspense>
  )
}
