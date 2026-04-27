'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { portalApi, type PortalOrderDetailDto } from '@/services/portal.service'
import { getFullImagePath } from '@/lib/path-utils'
import { useAuth } from '@/stores/authStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, MapPin, Package, Phone, StickyNote, Truck, Wallet } from 'lucide-react'

const statusPill = (status: number) => {
  if (status === 4) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
  if (status === 3) return 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
  if (status >= 0 && status < 3) return 'bg-amber-500/12 text-amber-800 dark:text-amber-200'
  return 'bg-muted text-muted-foreground'
}

function formatAddress(o: PortalOrderDetailDto) {
  const parts = [
    o.addressDetail,
    o.ward,
    o.province,
  ].filter((x) => x && String(x).trim() !== '') as string[]
  return parts.length > 0 ? parts.join(', ') : '—'
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const router = useRouter()
  const pathname = usePathname()
  const { fetchUserInfo } = useAuth()
  const [authReady, setAuthReady] = useState(false)
  const [order, setOrder] = useState<PortalOrderDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loginRedirect = `/dang-nhap?redirect=${encodeURIComponent(pathname || `/don-hang/${id}`)}`

  const load = useCallback(async () => {
    if (!id) {
      setError('Thiếu mã đơn.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const d = await portalApi.getOrder(id)
      setOrder(d)
    } catch (e) {
      if (isAxiosError(e)) {
        const s = e.response?.status
        if (s === 401) {
          router.replace(loginRedirect)
          return
        }
        if (s === 403) setError('Bạn không có quyền xem đơn này.')
        else if (s === 404) setError('Không tìm thấy đơn hàng.')
        else setError('Không tải được đơn hàng. Thử lại sau.')
      } else {
        setError('Đã xảy ra lỗi.')
      }
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [id, loginRedirect, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!getAccessToken()) {
      router.replace(loginRedirect)
      return
    }
    setAuthReady(true)
  }, [router, loginRedirect])

  useEffect(() => {
    if (!authReady) return
    void fetchUserInfo()
    void load()
  }, [authReady, fetchUserInfo, load])

  if (!authReady) {
    return (
      <main>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Đang tải...</div>
      </main>
    )
  }

  if (loading) {
    return (
      <main>
        <div className="border-b border-border bg-muted/80">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            <p className="text-sm text-muted-foreground">Đang tải đơn hàng…</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main>
        <div className="border-b border-border bg-muted/80">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1 text-muted-foreground" asChild>
              <Link href="/don-hang">
                <ArrowLeft className="h-4 w-4" />
                Đơn hàng
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Chi tiết đơn hàng</h1>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="text-muted-foreground">{error ?? 'Không có dữ liệu.'}</p>
          <Button asChild className="mt-6">
            <Link href="/don-hang">Về danh sách đơn</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="border-b border-border bg-muted/80">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 gap-1 text-muted-foreground" asChild>
            <Link href="/don-hang">
              <ArrowLeft className="h-4 w-4" />
              Tất cả đơn hàng
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mã đơn</p>
              <h1 className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                {order.orderCode}
              </h1>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full border border-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                statusPill(order.status),
              )}
            >
              {order.statusLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Đặt lúc{' '}
            {new Date(order.createdAt).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <Card className="border-border/80 p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
            <Truck className="h-5 w-5 text-primary" aria-hidden />
            Giao hàng
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{order.recipientName}</p>
                <p className="text-muted-foreground">{formatAddress(order)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a href={`tel:${order.recipientPhone}`} className="text-foreground underline-offset-4 hover:underline">
                {order.recipientPhone}
              </a>
            </div>
            {(order.trackingNumber || order.shippingProvider) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                {order.shippingProvider && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">ĐVVC:</span> {order.shippingProvider}
                  </p>
                )}
                {order.trackingNumber && (
                  <p className="mt-1 font-mono text-sm text-foreground">Mã vận đơn: {order.trackingNumber}</p>
                )}
              </div>
            )}
            {order.customerNote && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{order.customerNote}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-border/80 p-0 overflow-hidden">
          <div className="border-b border-border/80 bg-muted/30 px-4 py-3 sm:px-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
              <Package className="h-5 w-5 text-primary" aria-hidden />
              Sản phẩm
            </h2>
          </div>
          <ul className="list-none divide-y divide-border p-0" role="list">
            {order.items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
                Chưa có dòng hàng.
              </li>
            ) : (
              order.items.map((it) => {
                const href = `/san-pham/${encodeURIComponent(it.productId)}`
                const src = it.thumbnailUrl ? getFullImagePath(it.thumbnailUrl) : ''
                return (
                  <li key={it.id}>
                    <Link
                      href={href}
                      className={cn(
                        'group flex gap-3 px-4 py-4 no-underline sm:gap-4 sm:px-6 sm:py-5',
                        'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                      )}
                      aria-label={`Mở trang sản phẩm: ${it.productName}`}
                    >
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/80 bg-white p-1.5">
                        {src ? (
                          <img src={src} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug text-foreground group-hover:underline group-hover:decoration-primary/60">
                          {it.productName}
                        </p>
                        {it.variantName && (
                          <p className="mt-0.5 text-sm text-muted-foreground">{it.variantName}</p>
                        )}
                        {it.sku && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            <span className="font-mono">SKU: {it.sku}</span>
                          </p>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {it.quantity} × {it.unitPrice.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <p className="shrink-0 self-start text-sm font-semibold tabular-nums text-foreground sm:text-base">
                        {it.subTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </p>
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        </Card>

        <Card className="border-border/80 p-4 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground sm:text-lg">
            <Wallet className="h-5 w-5 text-primary" aria-hidden />
            Thanh toán
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-muted-foreground">Hình thức</span>
              <span className="font-medium text-foreground">{order.paymentMethodLabel}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-muted-foreground">Trạng thái thanh toán</span>
              <span className="font-medium text-foreground">{order.paymentStatusLabel}</span>
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span className="tabular-nums text-foreground">
                  {order.subTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí giao hàng</span>
                <span className="tabular-nums text-foreground">
                  {order.shippingFee > 0
                    ? order.shippingFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                    : '0đ'}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Giảm giá</span>
                  <span className="tabular-nums">−{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t-2 border-primary/20 pt-2 text-base font-bold text-foreground">
                <span>Tổng cộng</span>
                <span className="text-lg text-primary sm:text-xl">
                  {order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {order.cancelReason && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {order.cancelReason}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" asChild className="flex-1 sm:flex-initial">
            <Link href="/don-hang">Về danh sách</Link>
          </Button>
          <Button asChild className="flex-1 sm:flex-initial">
            <Link href="/san-pham">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
