'use client'
/**
 * Luồng chọn mua (theo model server: mỗi ProductVariant = một mã hàng, có attributeValueIds).
 *
 * - Có “phân loại” (variantAttrs): tổ hợp đủ → tìm mã active. Ưu tiên khớp multiset; nếu mã còn id
 *   thuộc tĩnh thì dùng khớp “mọi giá trị đang chọn đều nằm trên mã” (findExactActiveVariant).
 * - Chọn mã trong danh sách = áp toàn bộ tùy chọn theo đúng mã đó (buildAttrPickFromVariant),
 *   luôn đồng bộ với các nút phân loại (cùng một trạng thái, không hai nguồn tách rời).
 * - Không có phân loại (chỉ nhiều mã): state `skuOnlyVariantId` — chọn trực tiếp mã.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Check, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { portalApi } from '@/services/portal.service'
import type { ProductDetailDto, ProductAttributeDto, ProductVariantDto } from '@/services/product.service'
import { getFullImagePath } from '@/lib/path-utils'
import { useToast } from '@/hooks/use-toast'
import type { CartLine } from '@/types/cart'
import { cn } from '@/lib/utils'

function variantLabelFromIds(product: ProductDetailDto, v: ProductVariantDto) {
  const byVal = new Map<string, { attr: string; val: string }>()
  for (const a of product.attributes) {
    for (const x of a.values) {
      byVal.set(x.id, { attr: a.name, val: x.value })
      byVal.set(normId(x.id), { attr: a.name, val: x.value })
    }
  }
  return v.attributeValueIds
    .map((id) => byVal.get(String(id)) ?? byVal.get(normId(String(id))))
    .filter(Boolean)
    .map((x) => x!.val)
    .join(' · ')
}

/** Nhãn hiển thị / giỏ hàng: ưu tiên thuộc tính, sau đó tên mã, SKU. */
function variantLineLabel(product: ProductDetailDto, v: ProductVariantDto) {
  const fromAttr = variantLabelFromIds(product, v)
  if (fromAttr) return fromAttr
  if (v.name?.trim()) return v.name.trim()
  return v.sku
}

/** So sánh tập mã thuộc tính (API có thể khác hoa/thừa khoảng). */
function setIdsEqual(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false
  const sortKey = (s: string) => String(s).trim().toLowerCase()
  const sa = [...a].map(sortKey).sort()
  const sb = [...b].map(sortKey).sort()
  return sa.length === sb.length && sa.every((v, i) => v === sb[i])
}

function normId(s: string | null | undefined) {
  if (s == null) return ''
  return String(s).trim().toLowerCase()
}

const WISHLIST_KEY = 'ketsat_wishlist'

function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readWishlistProductIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as unknown
    return Array.isArray(arr) ? (arr as string[]).map(String) : []
  } catch {
    return []
  }
}

/**
 * Các mã thuộc tính trên biến thể tương ứng từng mục `variantAttrs` (bỏ id chỉ dùng cho
 * thuộc tính tĩnh / thông số) — cần cho so khớp với tùy chọn thuộc tính vì `v.attributeValueIds` có
 * thể dài hơn số tùy chọn biến thể.
 */
function valueIdsForVariantOptions(
  variantAttrs: ProductAttributeDto[],
  v: ProductVariantDto,
): string[] {
  const out: string[] = []
  for (const attr of variantAttrs) {
    for (const vid of v.attributeValueIds) {
      const val = attr.values.find((x) => normId(x.id) === normId(String(vid)))
      if (val) {
        out.push(val.id)
        break
      }
    }
  }
  return out
}

/** Mỗi valueId trên mã, map về mã thuộc tính phân loại (giữ thứ tự duyệt từ dữ liệu mã) — ổn với cả mã thừa id tĩnh. */
function matrixValueIdsOnVariant(
  variantAttrs: ProductAttributeDto[],
  v: ProductVariantDto,
): string[] {
  const out: string[] = []
  for (const vid of v.attributeValueIds) {
    for (const attr of variantAttrs) {
      const val = attr.values.find((x) => normId(x.id) === normId(String(vid)))
      if (val) {
        out.push(val.id)
        break
      }
    }
  }
  return out
}

function findExactActiveVariant(
  product: ProductDetailDto,
  variantAttrs: ProductAttributeDto[],
  attrPick: Record<string, string>,
): ProductVariantDto | null {
  const picked = variantAttrs.map((a) => attrPick[a.id]).filter((id): id is string => Boolean(id))
  if (picked.length !== variantAttrs.length) return null

  for (const v of product.variants) {
    if (!v.isActive) continue
    if (setIdsEqual(picked, valueIdsForVariantOptions(variantAttrs, v))) return v
  }

  for (const v of product.variants) {
    if (!v.isActive) continue
    if (setIdsEqual(picked, matrixValueIdsOnVariant(variantAttrs, v))) return v
  }

  const allOnVariant = (v: ProductVariantDto) =>
    variantAttrs.every((a) => {
      const p = attrPick[a.id]
      if (!p) return false
      return v.attributeValueIds.some((x) => normId(x) === normId(p))
    })

  const candidates = product.variants.filter((v) => v.isActive && allOnVariant(v))
  if (candidates.length === 1) return candidates[0]
  for (const v of candidates) {
    if (setIdsEqual(picked, valueIdsForVariantOptions(variantAttrs, v))) return v
  }
  for (const v of candidates) {
    if (setIdsEqual(picked, matrixValueIdsOnVariant(variantAttrs, v))) return v
  }
  return null
}

const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeDecodeSegment(s: string) {
  if (!s) return ''
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

type Props = { initialSlug: string }

export default function ProductDetailClient({ initialSlug }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const slug = safeDecodeSegment(initialSlug)

  const [product, setProduct] = useState<ProductDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  /** Tổ hợp từng thuộc tính phân loại (attribute id → value id). Cùng nguồn với chọn mã từ list (list áp từ mã). */
  const [attrPick, setAttrPick] = useState<Record<string, string>>({})
  /**
   * Chỉ dùng khi sản phẩm **không** có variantAttrs (chỉ chọn từ danh sách mã, không matrix nút).
   */
  const [skuOnlyVariantId, setSkuOnlyVariantId] = useState<string | null>(null)
  const [galleryIndex, setGalleryIndex] = useState(0)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    const load = guidRe.test(slug)
      ? portalApi.getProductDetail(slug)
      : portalApi.getProductDetailBySlug(slug)
    load
      .then(setProduct)
      .catch((err) => {
        console.error('Failed to fetch product detail:', err)
        setProduct(null)
      })
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product?.slug || !slug) return
    if (guidRe.test(slug) && product.slug !== slug) {
      router.replace(`/san-pham/${encodeURIComponent(product.slug)}`, { scroll: false })
    }
  }, [product?.slug, slug, router])

  useEffect(() => {
    if (!product?.id) return
    setIsWishlisted(readWishlistProductIds().includes(String(product.id)))
  }, [product?.id])

  const toggleWishlist = useCallback(() => {
    if (!product) return
    const pid = String(product.id)
    const current = readWishlistProductIds()
    const isIn = current.includes(pid)
    const next = isIn ? current.filter((x) => x !== pid) : [...current, pid]
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next))
    } catch {
      toast({
        title: 'Không lưu được',
        description: 'Trình duyệt từ chối lưu danh sách (Storage đầy hoặc chế độ riêng tư).',
        variant: 'destructive',
      })
      return
    }
    setIsWishlisted(!isIn)
    window.dispatchEvent(new Event('wishlist-updated'))
    if (isIn) {
      toast({
        variant: 'default',
        title: 'Đã xóa khỏi yêu thích',
        description: 'Sản phẩm đã gỡ khỏi danh sách.',
      })
    } else {
      toast({
        variant: 'success',
        title: 'Đã thêm vào yêu thích',
        description: 'Bạn xem tại mục Sản phẩm yêu thích.',
      })
    }
  }, [product, toast])

  /** Tùy chọn biến thể: theo isVariantOption; nếu admin chưa bật nhưng mã vẫn gắn mã thuộc tính thì suy từ dữ liệu biến thể. */
  const variantAttrs = useMemo(() => {
    if (!product) return []
    const all = product.attributes
    const explicit = all.filter((a) => a.isVariantOption)
    if (explicit.length > 0) return explicit
    if (!product.variants?.length) return []
    const onVariant = new Set<string>()
    for (const v of product.variants) {
      for (const id of v.attributeValueIds) {
        onVariant.add(normId(String(id)))
      }
    }
    return all
      .filter((a) => a.values.some((val) => onVariant.has(normId(val.id))))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [product])

  const displayVariants = useMemo(() => {
    if (!product?.variants.length) return []
    const act = product.variants.filter((v) => v.isActive)
    return act.length > 0 ? act : product.variants
  }, [product])

  const buildAttrPickFromVariant = useCallback(
    (v: ProductVariantDto) => {
      const next: Record<string, string> = {}
      if (!product) return next
      if (variantAttrs.length > 0) {
        for (const attr of variantAttrs) {
          for (const vid of v.attributeValueIds) {
            const val = attr.values.find((x) => normId(x.id) === normId(String(vid)))
            if (val) {
              next[attr.id] = val.id
              break
            }
          }
        }
        return next
      }
      for (const vid of v.attributeValueIds) {
        for (const a of product.attributes) {
          const val = a.values.find((x) => normId(x.id) === normId(String(vid)))
          if (val) {
            next[a.id] = val.id
            break
          }
        }
      }
      return next
    },
    [product, variantAttrs],
  )

  // Khởi tạo: mã mẫu + attrPick từ cùng mã; nếu không có matrix thì dùng skuOnlyVariantId
  useEffect(() => {
    if (!product) return
    if (product.variants.length === 0) {
      setAttrPick({})
      setSkuOnlyVariantId(null)
      return
    }
    const ordered = [...product.variants].filter((v) => v.isActive)
    const pool = ordered.length > 0 ? ordered : product.variants
    const first =
      pool.find((v) => v.isActive && v.attributeValueIds.length > 0) ??
      pool.find((v) => v.isActive) ??
      pool[0]
    setAttrPick(buildAttrPickFromVariant(first!))
    if (variantAttrs.length === 0) {
      setSkuOnlyVariantId(first?.id ?? null)
    } else {
      setSkuOnlyVariantId(null)
    }
  }, [product?.id, variantAttrs, buildAttrPickFromVariant])

  const selectedVariant = useMemo(() => {
    if (!product) return null
    if (product.variants.length === 0) return null

    const findActiveById = (id: string | null) => {
      if (!id) return null
      return product.variants.find((v) => normId(v.id) === normId(id) && v.isActive) ?? null
    }

    if (variantAttrs.length > 0) {
      return findExactActiveVariant(product, variantAttrs, attrPick)
    }

    return findActiveById(skuOnlyVariantId) ?? displayVariants[0] ?? null
  }, [product, attrPick, variantAttrs, skuOnlyVariantId, displayVariants])

  const onPickValue = useCallback(
    (attr: ProductAttributeDto, valueId: string) => {
      if (!product) return
      const nextPick = { ...attrPick, [attr.id]: valueId }
      setAttrPick(nextPick)
      if (variantAttrs.length > 0) {
        if (findExactActiveVariant(product, variantAttrs, nextPick)) {
          setGalleryIndex(0)
        }
      }
    },
    [product, attrPick, variantAttrs],
  )

  const displayPrice = useMemo(() => {
    if (!product) return 0
    if (selectedVariant) return selectedVariant.price
    return product.salePrice ?? product.basePrice ?? 0
  }, [product, selectedVariant])

  const displayComparePrice = useMemo(() => {
    if (!product) return null
    if (selectedVariant) {
      if (selectedVariant.originalPrice != null && selectedVariant.originalPrice > selectedVariant.price) {
        return selectedVariant.originalPrice
      }
      return null
    }
    if (product.salePrice && product.basePrice && product.salePrice < product.basePrice) {
      return product.basePrice
    }
    return null
  }, [product, selectedVariant])

  const galleryUrls = useMemo(() => {
    if (!product) return []
    const out: string[] = []
    const seen = new Set<string>()
    const add = (u: string | null | undefined) => {
      if (!u || seen.has(u)) return
      seen.add(u)
      out.push(u)
    }
    if (selectedVariant) {
      add(selectedVariant.imageUrl)
      for (const g of selectedVariant.galleryImageUrls ?? []) add(g)
    }
    add(product.thumbnailUrl)
    for (const im of product.images ?? []) add(im.imageUrl)
    return out
  }, [product, selectedVariant])

  const mainSrc = galleryUrls[galleryIndex] ?? galleryUrls[0] ?? null

  useEffect(() => {
    if (galleryIndex >= galleryUrls.length) setGalleryIndex(0)
  }, [galleryIndex, galleryUrls.length])

  const stockQty = selectedVariant?.stockQuantity ?? 0
  const inStock =
    product &&
    (product.variants.length === 0 ||
      (selectedVariant != null && selectedVariant.isActive && stockQty > 0))

  const variantAttrIdSet = useMemo(() => new Set(variantAttrs.map((a) => a.id)), [variantAttrs])

  const staticAttrs = useMemo(() => {
    if (!product) return []
    return product.attributes.filter((a) => !variantAttrIdSet.has(a.id))
  }, [product, variantAttrIdSet])

  const addToCart = () => {
    if (!product) return
    let cartVariant: ProductVariantDto | null = null
    if (product.variants.length > 0) {
      if (variantAttrs.length > 0) {
        const allFilled = variantAttrs.every((a) => Boolean(attrPick[a.id]))
        if (!allFilled) {
          toast({
            title: 'Chưa đủ tùy chọn',
            description: 'Vui lòng chọn đủ từng mục phân loại (thuộc tính) để xác định mã hàng.',
            variant: 'destructive',
          })
          return
        }
        cartVariant = findExactActiveVariant(product, variantAttrs, attrPick)
        if (!cartVariant) {
          toast({
            title: 'Không có mã tương ứng',
            description: 'Tổ hợp tùy chọn chưa trùng với mã nào trên hệ thống; hãy đổi thuộc tính hoặc mã cho khớp.',
            variant: 'destructive',
          })
          return
        }
      } else {
        cartVariant = selectedVariant
        if (!cartVariant) {
          toast({ title: 'Chưa chọn biến thể', description: 'Vui lòng chọn một mã sản phẩm.', variant: 'destructive' })
          return
        }
      }
      if (cartVariant.stockQuantity <= 0) {
        toast({ title: 'Hết hàng', description: 'Biến thể này tạm hết, vui lòng chọn khác.', variant: 'destructive' })
        return
      }
    }
    if (quantity < 1) return

    const priceForLine =
      cartVariant != null ? cartVariant.price : displayPrice
    const rawLabel =
      product.variants.length > 0 && cartVariant != null
        ? variantLineLabel(product, cartVariant)
        : null
    const vLabel =
      rawLabel != null && String(rawLabel).trim() !== ''
        ? String(rawLabel).trim()
        : product.variants.length > 0 && cartVariant != null
          ? (cartVariant.sku?.trim() || 'Biến thể')
          : null
    const image =
      (cartVariant?.imageUrl ? getFullImagePath(cartVariant.imageUrl) : null) ||
      (product.thumbnailUrl ? getFullImagePath(product.thumbnailUrl) : null)

    const line: CartLine = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: priceForLine,
      quantity,
      image,
      category: product.categoryName,
      variantId: cartVariant?.id ?? null,
      variantLabel: vLabel,
      variantSku: cartVariant?.sku?.trim() ? cartVariant.sku.trim() : null,
    }

    const raw = localStorage.getItem('ketsat_cart')
    let cart: CartLine[] = []
    if (raw) {
      try {
        cart = JSON.parse(raw) as CartLine[]
      } catch {
        cart = []
      }
    }
    const key = `${line.id}::${line.variantId ?? ''}`
    const index = cart.findIndex((c) => `${c.id}::${c.variantId ?? ''}` === key)
    if (index > -1) {
      // Giữ metadata biến thể mới nhất, cộng số lượng (tránh mất variantLabel khi cộng dồn).
      cart[index] = {
        ...line,
        quantity: cart[index].quantity + line.quantity,
      }
    } else {
      cart.push(line)
    }
    localStorage.setItem('ketsat_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))
    toast({ variant: 'success', title: 'Đã thêm vào giỏ hàng', description: `Đã thêm “${product.name}”.` })
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải thông tin sản phẩm…</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold">Không tìm thấy sản phẩm</h1>
            <p className="mb-8 text-muted-foreground">
              Đường dẫn không tồn tại hoặc sản phẩm đã ngừng kinh doanh.
            </p>
            <Button asChild>
              <Link href="/san-pham">Quay lại danh sách</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/san-pham" className="transition hover:text-foreground">
            Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-8">
              {mainSrc ? (
                <img
                  src={getFullImagePath(mainSrc)}
                  alt={product.name}
                  className="max-h-[420px] max-w-full object-contain transition duration-500"
                />
              ) : (
                <div className="text-9xl">🔒</div>
              )}
            </div>
            {galleryUrls.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i <= 0 ? galleryUrls.length - 1 : i - 1))}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                  {galleryUrls.map((u, idx) => (
                    <button
                      key={u + idx}
                      type="button"
                      onClick={() => setGalleryIndex(idx)}
                      className={cn(
                        'h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 p-0.5 transition',
                        idx === galleryIndex ? 'border-primary ring-1 ring-primary/30' : 'border-transparent opacity-80 hover:opacity-100',
                      )}
                    >
                      <img
                        src={getFullImagePath(u)}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryIndex((i) => (i >= galleryUrls.length - 1 ? 0 : i + 1))}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              Ảnh trên thay đổi theo biến thể đang chọn (kèm ảnh mô tả riêng từng mã nếu có).
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold">{product.name}</h1>
              </div>
              <button
                type="button"
                onClick={toggleWishlist}
                className="rounded-full p-3 transition hover:bg-muted"
                aria-pressed={isWishlisted}
                title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart
                  size={24}
                  className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                />
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-primary tabular-nums">
                {displayPrice.toLocaleString('vi-VN')}₫
              </span>
              {displayComparePrice != null && (
                <span className="text-lg text-muted-foreground line-through tabular-nums">
                  {displayComparePrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {selectedVariant && (
              <p className="mb-2 text-sm text-muted-foreground">
                SKU: <span className="font-mono text-foreground">{selectedVariant.sku}</span>
                {selectedVariant.name ? ` · ${selectedVariant.name}` : ''}
              </p>
            )}

            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              {product.shortDescription ||
                (product.description ? `${stripHtmlToText(product.description).slice(0, 200)}…` : '—')}
            </p>

            {variantAttrs.length > 0 && (
              <div className="mb-6 space-y-4">
                <h3 className="text-base font-bold text-foreground">1. Phân loại (màu, kích thước, …)</h3>
                <p className="text-sm text-muted-foreground">
                  Mỗi tổ hợp đủ từng mục trùng đúng <span className="text-foreground">một mã</span> trên hệ thống. Bạn cũng
                  có thể chọn thẳng mã ở bước 2 — các nút ở đây sẽ khớp theo mã đó.
                </p>
                {variantAttrs.map((attr) => (
                  <div key={attr.id}>
                    <p className="mb-2 text-sm font-semibold text-foreground">{attr.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => {
                        const active = normId(attrPick[attr.id]) === normId(val.id)
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => onPickValue(attr, val.id)}
                            className={cn(
                              'min-h-9 rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                              active
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background hover:border-primary/50',
                            )}
                            style={val.colorHex ? { borderColor: active ? undefined : val.colorHex } : undefined}
                          >
                            {val.value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {displayVariants.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-1 text-base font-bold text-foreground">
                  {variantAttrs.length > 0
                    ? '2. Mã sản phẩm (SKU) — tùy chọn nhanh'
                    : 'Chọn phiên bản sản phẩm (mã / SKU)'}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {variantAttrs.length > 0
                    ? 'Bấm một dòng: hệ thống gán lại từng tùy chọn ở bước 1 theo đúng mã đó (cùng một tổ hợp).'
                    : 'Giá, kho và hình ảnh theo từng mã. Đưa vào giỏ sẽ mua đúng phiên bản đang chọn.'}
                </p>
                {displayVariants.length === 1 ? (
                  <div
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm',
                      displayVariants[0].isActive
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/40 opacity-80',
                    )}
                  >
                    <span className="text-muted-foreground">Phiên bản: </span>
                    <span className="font-mono font-semibold text-foreground">{displayVariants[0].sku}</span>
                    {displayVariants[0].name && (
                      <span className="text-foreground"> — {displayVariants[0].name}</span>
                    )}
                    <span className="ml-2 tabular-nums text-primary">
                      {displayVariants[0].price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {displayVariants[0].isActive
                        ? `(còn ${displayVariants[0].stockQuantity})`
                        : 'Ngừng bán'}
                    </span>
                  </div>
                ) : (
                  <ul className="space-y-2" role="listbox" aria-label="Chọn mã sản phẩm">
                    {displayVariants.map((v) => {
                      const selected = selectedVariant != null && normId(selectedVariant.id) === normId(v.id)
                      const line = variantLineLabel(product, v)
                      const disabled = !v.isActive
                      return (
                        <li key={v.id}>
                          <button
                            type="button"
                            role="option"
                            disabled={disabled}
                            aria-selected={selected}
                            onClick={() => {
                              if (!v.isActive) {
                                toast({
                                  title: 'Không còn bán',
                                  description: 'Mã này đã ngừng kinh doanh. Vui lòng chọn mã khác.',
                                  variant: 'destructive',
                                })
                                return
                              }
                              if (variantAttrs.length > 0) {
                                setAttrPick(buildAttrPickFromVariant(v))
                              } else {
                                setSkuOnlyVariantId(v.id)
                              }
                              setGalleryIndex(0)
                            }}
                            className={cn(
                              'flex w-full gap-3 rounded-xl border p-3 text-left transition',
                              disabled && 'cursor-not-allowed opacity-60',
                              selected
                                ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                : 'border-border bg-card hover:border-primary/40',
                            )}
                          >
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                              {v.imageUrl ? (
                                <img
                                  src={getFullImagePath(v.imageUrl)}
                                  alt=""
                                  className="h-full w-full object-contain p-0.5"
                                />
                              ) : (
                                <span className="text-2xl text-slate-300" aria-hidden>
                                  📦
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-mono text-sm font-semibold text-foreground">{v.sku}</p>
                              <p className="line-clamp-2 text-sm text-foreground">{line}</p>
                              <div className="mt-1 flex flex-wrap items-baseline gap-2 text-sm">
                                <span className="font-bold tabular-nums text-primary">
                                  {v.price.toLocaleString('vi-VN')}₫
                                </span>
                                {v.originalPrice != null && v.originalPrice > v.price && (
                                  <span className="text-xs text-muted-foreground line-through tabular-nums">
                                    {v.originalPrice.toLocaleString('vi-VN')}₫
                                  </span>
                                )}
                                <span
                                  className={cn(
                                    'text-xs',
                                    v.stockQuantity > 0 ? 'text-muted-foreground' : 'text-destructive',
                                  )}
                                >
                                  {v.stockQuantity > 0 ? `Còn ${v.stockQuantity}` : 'Hết hàng'}
                                </span>
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {product.variants.length > 0 && !selectedVariant && (
              <p className="mb-4 text-sm font-medium text-amber-700">
                {variantAttrs.length > 0
                  ? 'Chọn đủ từng mục phân loại (hoặc bấm một mã ở danh sách) cho đến khi tổ hợp trùng một mã còn bán.'
                  : 'Vui lòng chọn một mã sản phẩm.'}
              </p>
            )}

            {product.variants.length > 0 && selectedVariant != null && (
              <p className="mb-6 text-sm text-muted-foreground">
                Kho: <span className="font-semibold text-foreground tabular-nums">{stockQty}</span>
                {!inStock && <span className="ml-2 text-destructive">Hết hàng</span>}
              </p>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/50 p-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Danh mục</p>
                <p className="font-semibold">{product.categoryName || '—'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Thương hiệu</p>
                <p className="font-semibold">{product.brandName || '—'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Mã hàng (SP)</p>
                <p className="font-semibold">{product.sku || '—'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Trạng thái</p>
                <p className="font-semibold text-green-600">{product.statusLabel}</p>
              </div>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="border-r border-border px-4 py-2 font-bold transition hover:bg-muted"
                >
                  −
                </button>
                <span className="min-w-[60px] px-4 py-2 text-center font-semibold tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (product.variants.length > 0 && selectedVariant) {
                      setQuantity((q) => Math.min(stockQty || q, q + 1))
                    } else {
                      setQuantity((q) => q + 1)
                    }
                  }}
                  className="border-l border-border px-4 py-2 font-bold transition hover:bg-muted"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="h-12 flex-1 bg-primary font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                onClick={addToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={20} className="mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 border-b border-border">
          <div className="flex flex-wrap gap-4 sm:gap-8">
            {[
              { id: 'description', label: 'Mô tả chi tiết' },
              { id: 'specs', label: 'Thuộc tính & thông số' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative py-4 text-sm font-bold uppercase tracking-wider transition',
                  activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            {activeTab === 'description' && (
              <div className="prose prose-slate max-w-none">
                <h2 className="mb-4 text-2xl font-bold">Mô tả sản phẩm</h2>
                {product.description ? (
                  <div
                    className="leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <div className="leading-relaxed text-muted-foreground">Đang cập nhật mô tả…</div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Thông số & thuộc tính</h2>
                {product.specifications && (
                  <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-6 text-muted-foreground">
                    {product.specifications}
                  </div>
                )}
                {staticAttrs.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <p className="bg-muted/60 px-4 py-2 text-sm font-bold">Thuộc tính (không theo mã biến thể)</p>
                    {staticAttrs.map((attr) => (
                      <div key={attr.id} className="grid grid-cols-1 gap-2 border-t border-border p-4 sm:grid-cols-3 sm:items-center">
                        <span className="font-semibold text-foreground">{attr.name}</span>
                        <span className="text-muted-foreground sm:col-span-2">
                          {attr.values.map((v) => v.value).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {product.variants.length > 0 && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <p className="bg-muted/60 px-4 py-2 text-sm font-bold">Biến thể</p>
                    <div className="max-h-80 overflow-auto">
                      {product.variants.map((v) => (
                        <div
                          key={v.id}
                          className="grid grid-cols-1 gap-1 border-t border-border p-3 text-sm sm:grid-cols-4"
                        >
                          <span className="font-mono text-xs sm:col-span-1">{v.sku}</span>
                          <span className="text-muted-foreground sm:col-span-2">
                            {variantLineLabel(product, v)}
                            {v.name ? ` — ${v.name}` : ''}
                          </span>
                          <span className="font-semibold tabular-nums sm:text-right">
                            {v.price.toLocaleString('vi-VN')}₫ · còn {v.stockQuantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {staticAttrs.length === 0 && !product.specifications && product.variants.length === 0 && (
                  <p className="text-muted-foreground">Đang cập nhật thông số…</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <p className="text-muted-foreground">Đang phát triển phần đánh giá từ khách hàng.</p>
            )}
          </div>

          <aside className="h-fit space-y-6">
            <Card className="relative overflow-hidden rounded-2xl border-primary/20 bg-primary/5 p-6">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
              <h3 className="relative z-10 mb-4 font-bold text-primary">Cam kết</h3>
              <ul className="relative z-10 space-y-3 text-sm text-muted-foreground">
                {['Hàng chính hãng', 'Giao hàng & bảo hành theo chính sách', 'Hỗ trợ tư vấn'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check size={16} className="flex-shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
