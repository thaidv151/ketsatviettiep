'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Heart, Package, ShoppingBag, Sparkles, ArrowUpRight, Percent, Compass } from 'lucide-react'
import { portalApi, type PortalProductDto } from '@/services/portal.service'
import { getFullImagePath } from '@/lib/path-utils'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { RevealOnScroll } from '@/components/reveal-on-scroll'

function hasDiscount(p: PortalProductDto) {
  return (
    p.salePrice != null && p.basePrice != null && p.salePrice < p.basePrice
  )
}

function splitCatalog(all: PortalProductDto[]) {
  const featured = all.filter((p) => p.isFeatured).slice(0, 4)
  const fIds = new Set(featured.map((p) => p.id))
  const onSale = all
    .filter((p) => !fIds.has(p.id) && hasDiscount(p))
    .slice(0, 4)
  const sIds = new Set(onSale.map((p) => p.id))
  const more = all.filter((p) => !fIds.has(p.id) && !sIds.has(p.id)).slice(0, 4)
  return { featured, onSale, more }
}

type ProductGridProps = {
  products: PortalProductDto[]
  wishlist: string[]
  onWishlist: (e: MouseEvent<HTMLButtonElement>, id: string) => void
  onAddCart: (e: MouseEvent<HTMLButtonElement>, p: PortalProductDto) => void
  startDelay: number
}

function ProductGrid({ products, wishlist, onWishlist, onAddCart, startDelay }: ProductGridProps) {
  if (products.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {products.map((product, index) => {
        const disc = hasDiscount(product)
        const price = product.salePrice ?? product.basePrice
        return (
          <RevealOnScroll key={product.id} delayMs={startDelay + index * 70}>
            <div className="group/card relative h-full">
              <Link
                href={`/san-pham/${encodeURIComponent(product.slug || product.id)}`}
                className={cn(
                  'relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white',
                  'shadow-sm shadow-slate-200/40 transition-all duration-300',
                  'hover:-translate-y-1.5 hover:border-slate-300/90 hover:shadow-xl hover:shadow-slate-200/60',
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-slate-100/90 to-slate-50/50">
                  {product.thumbnailUrl ? (
                    <img
                      src={getFullImagePath(product.thumbnailUrl)}
                      alt={product.name}
                      className="h-full w-full object-contain p-4 transition duration-500 ease-out group-hover/card:scale-[1.06]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Package className="h-16 w-16" strokeWidth={1.25} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 via-transparent to-transparent opacity-0 transition group-hover/card:opacity-100" />
                  {disc && (
                    <span className="absolute right-2.5 top-2.5 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                      Sale
                    </span>
                  )}
                  <span className="absolute left-2.5 top-2.5 inline-flex max-w-[50%] truncate rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur">
                    {product.categoryName || 'Két sắt'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onWishlist(e, product.id)}
                    className="absolute left-2.5 top-10 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-white hover:text-rose-500"
                    aria-label="Yêu thích"
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4',
                        wishlist.includes(product.id) && 'fill-rose-500 text-rose-500',
                      )}
                      strokeWidth={2}
                    />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#1677ff] to-sky-400 transition group-hover/card:scale-x-100" />
                </div>
                <div className="flex flex-1 flex-col p-4 pt-3.5">
                  <h3 className="line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug text-slate-900">
                    {product.name}
                  </h3>
                  <div className="mt-auto space-y-3 pt-2">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      {price != null ? (
                        <span className="text-xl font-extrabold tabular-nums text-slate-900">
                          {price.toLocaleString('vi-VN')}
                          <span className="ml-0.5 text-base font-bold text-slate-600">₫</span>
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-slate-500">Liên hệ</span>
                      )}
                      {disc && product.basePrice != null && (
                        <span className="text-sm text-slate-400 line-through">
                          {product.basePrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900/5 text-xs font-bold uppercase tracking-wide text-slate-500 transition group-hover/card:bg-[#1677ff]/10 group-hover/card:text-[#0958d9]">
                        Chi tiết
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={(e) => onAddCart(e, product)}
                      className="h-10 w-full gap-2 rounded-lg bg-[#1677ff] text-xs font-bold uppercase tracking-widest text-white shadow-sm transition hover:!bg-[#0958d9]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </RevealOnScroll>
        )
      })}
    </div>
  )
}

const skeletonBlock = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm"
      >
        <div className="aspect-[4/5] animate-pulse bg-slate-200/60" />
        <div className="space-y-3 p-4">
          <div className="h-3 w-1/3 max-w-[6rem] animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/5 max-w-[12rem] animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-1/2 max-w-[8rem] animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
)

const FeaturedProducts = () => {
  const [catalog, setCatalog] = useState<PortalProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState<string[]>([])
  const { toast } = useToast()

  const { featured, onSale, more } = useMemo(() => splitCatalog(catalog), [catalog])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const all = await portalApi.getProducts()
      setCatalog(Array.isArray(all) ? all : [])
      const w = localStorage.getItem('ketsat_wishlist')
      if (w) setWishlist(JSON.parse(w) as string[])
    } catch (e) {
      console.error('Failed to load products:', e)
      setCatalog([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onWishlist = (e: MouseEvent<HTMLButtonElement>, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const next = [...wishlist]
    const idx = next.indexOf(productId)
    if (idx > -1) {
      next.splice(idx, 1)
      toast({ variant: 'default', title: 'Đã xóa khỏi yêu thích' })
    } else {
      next.push(productId)
      toast({ variant: 'success', title: 'Đã thêm vào yêu thích' })
    }
    setWishlist(next)
    localStorage.setItem('ketsat_wishlist', JSON.stringify(next))
  }

  const onAddCart = (e: MouseEvent<HTMLButtonElement>, product: PortalProductDto) => {
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

  const hasAny = featured.length + onSale.length + more.length > 0
  const sectionShell = (tone: 'light' | 'alt') =>
    tone === 'alt' ? 'bg-slate-100/50' : 'bg-gradient-to-b from-slate-50 via-white to-slate-50/90'
  return (
    <div>
      {loading && (
        <section
          className="relative border-b border-slate-200/50 py-8 sm:py-20"
          aria-hidden
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {skeletonBlock()}
          </div>
        </section>
      )}

      {!loading && !hasAny && (
        <section className="border-b border-slate-200/50 bg-slate-50/80 py-8">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <Package className="mx-auto mb-2 h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <h2 className="text-lg font-bold text-slate-800">Chưa có sản phẩm</h2>
            <p className="mt-1 text-sm text-slate-500">Vui lòng quay lại sau.</p>
            <Link
              className="mt-3 inline-block text-sm font-semibold text-[#1677ff] hover:underline"
              href="/san-pham"
            >
              Danh sách sản phẩm
            </Link>
          </div>
        </section>
      )}

      {!loading && hasAny && (
        <>
          {featured.length > 0 && (
            <section
              id="san-pham-noi-bat"
              className={cn(
                'scroll-mt-24 relative overflow-hidden border-b border-slate-200/50 py-8 sm:py-12',
                sectionShell('light'),
              )}
              aria-labelledby="heading-san-pham-noi-bat"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(22,119,255,0.12),transparent)]"
                aria-hidden
              />
              <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <RevealOnScroll className="mb-12 text-center sm:mb-16">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                    Lựa chọn hôm nay
                  </p>
                  <h2
                    id="heading-san-pham-noi-bat"
                    className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
                  >
                    Sản phẩm nổi bật
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                    Mẫu được gắn nhãn nổi bật: két gia dụng và công nghiệp, phù hợp bảo mật tài sản, hồ sơ, tiền mặt.
                  </p>
                </RevealOnScroll>
                <ProductGrid
                  products={featured}
                  wishlist={wishlist}
                  onWishlist={onWishlist}
                  onAddCart={onAddCart}
                  startDelay={0}
                />
              </div>
            </section>
          )}

          {onSale.length > 0 && (
            <section
              id="uu-dai"
              className={cn(
                'scroll-mt-24 relative border-b border-slate-200/50 py-8 sm:py-12',
                sectionShell('alt'),
              )}
              aria-labelledby="heading-uu-dai"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <RevealOnScroll className="mb-12 text-center sm:mb-16">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-rose-50/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700/90">
                    <Percent className="h-3.5 w-3.5" aria-hidden />
                    Giá tốt
                  </p>
                  <h2
                    id="heading-uu-dai"
                    className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
                  >
                    Ưu đãi &amp; giảm giá
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                    Sản phẩm đang có giá bán ưu đãi hơn giá niêm yết (khác với bộ sưu tập nổi bật khi cùng tồn tại).
                  </p>
                </RevealOnScroll>
                <ProductGrid
                  products={onSale}
                  wishlist={wishlist}
                  onWishlist={onWishlist}
                  onAddCart={onAddCart}
                  startDelay={40}
                />
              </div>
            </section>
          )}

          {more.length > 0 && (
            <section
              id="goi-y-them"
              className="scroll-mt-24 relative border-b border-slate-200/50 bg-gradient-to-b from-white to-slate-50/80 py-8 sm:py-12"
              aria-labelledby="heading-goi-y"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <RevealOnScroll className="mb-12 text-center sm:mb-16">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                    <Compass className="h-3.5 w-3.5 text-sky-600" aria-hidden />
                    Khám phá
                  </p>
                  <h2
                    id="heading-goi-y"
                    className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
                  >
                    Gợi ý thêm cho bạn
                  </h2>
                  <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                    Các sản phẩm còn lại trong mục lục, giúp bạn so sánh mẫu mã trước khi mua hàng.
                  </p>
                </RevealOnScroll>
                <ProductGrid
                  products={more}
                  wishlist={wishlist}
                  onWishlist={onWishlist}
                  onAddCart={onAddCart}
                  startDelay={80}
                />
              </div>
            </section>
          )}

          <div className="bg-slate-50/50 py-5">
            <RevealOnScroll className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6" delayMs={100}>
              <Button
                asChild
                className="h-11 rounded-lg border-2 border-slate-200/90 bg-white px-8 font-bold uppercase tracking-widest text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Link href="/san-pham">Xem tất cả sản phẩm</Link>
              </Button>
            </RevealOnScroll>
          </div>
        </>
      )}
    </div>
  )
}

export default FeaturedProducts
