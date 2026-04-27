'use client'

import { useState, useEffect, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/stores/authStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { portalApi, type PortalOrderDto } from '@/services/portal.service'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { cn } from '@/lib/utils'
import { ChevronRight, Check, Clock, Package, Truck } from 'lucide-react'

const LOGIN_DON_HANG = '/dang-nhap?redirect=' + encodeURIComponent('/don-hang')

const statusTextClass = (status: number) => {
  if (status === 4) return 'text-sky-600 dark:text-sky-400'
  if (status === 3) return 'text-sky-600 dark:text-sky-400'
  if (status >= 0 && status < 3) return 'text-amber-600 dark:text-amber-500'
  return 'text-muted-foreground'
}

const tabs: {
  id: 'all' | 'pending' | 'shipped' | 'delivered'
  label: string
  icon?: ComponentType<{ className?: string }>
  filter: (o: PortalOrderDto) => boolean
}[] = [
  { id: 'all', label: 'Tất cả', filter: () => true },
  { id: 'pending', label: 'Chờ xử lý', icon: Clock, filter: (o) => o.status < 3 },
  { id: 'shipped', label: 'Đang giao', icon: Truck, filter: (o) => o.status === 3 },
  { id: 'delivered', label: 'Đã giao', icon: Check, filter: (o) => o.status === 4 },
]

function countInTab(orders: PortalOrderDto[], id: (typeof tabs)[number]['id']) {
  const t = tabs.find((x) => x.id === id)
  if (!t) return 0
  if (id === 'all') return orders.length
  return orders.filter(t.filter).length
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PortalOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('all')
  const { fetchUserInfo } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!getAccessToken()) {
      router.replace(LOGIN_DON_HANG)
      return
    }
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    if (!authReady) return
    void fetchUserInfo()
    setLoading(true)
    portalApi
      .getOrders()
      .then((data) => {
        setOrders(data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [authReady, fetchUserInfo])

  const filteredOrders = orders.filter(
    (o) => tabs.find((t) => t.id === activeTab)?.filter(o) ?? true,
  )

  if (!authReady) {
    return (
      <main>
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">Đang tải...</div>
      </main>
    )
  }

  return (
    <main>
      <div className="border-b border-border bg-muted/80">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Đơn hàng của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi trạng thái — bấm vào đơn để xem chi tiết
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Lọc theo trạng thái"
        >
          {tabs.map((t) => {
            const count = countInTab(orders, t.id)
            const Icon = t.icon
            const isActive = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-foreground shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50',
                )}
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                {t.label}
                <span className="tabular-nums text-xs opacity-80">({count})</span>
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Đang tải...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground"
              aria-hidden
            >
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Chưa có đơn hàng</h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-muted-foreground">
              Khi bạn mua sắm, đơn sẽ hiển thị tại đây. Bạn có thể theo từng bước từ &quot;Chờ xử lý&quot;
              tới &quot;Đang giao&quot; và &quot;Đã giao&quot;.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link href="/san-pham">Mua sắm ngay</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Danh sách đơn hàng">
            {filteredOrders.map((order) => (
              <li key={order.id}>
                <Link href={`/don-hang/${order.id}`} className="block group">
                  <Card
                    className={cn(
                      'overflow-hidden border-border bg-card transition',
                      'hover:border-primary/35 hover:shadow-md',
                    )}
                  >
                    <div className="flex items-stretch gap-0">
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-sm font-bold tabular-nums text-foreground sm:text-base">
                            {order.orderCode}
                          </span>
                          <span
                            className={cn(
                              'text-xs font-semibold uppercase tracking-wide',
                              statusTextClass(order.status),
                            )}
                          >
                            {order.statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {new Date(order.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {order.itemCount} sản phẩm
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center border-l border-border bg-muted/30 px-4 sm:px-5">
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums text-foreground sm:text-base">
                            {order.totalAmount.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                          <p className="mt-0.5 flex items-center justify-end gap-0.5 text-xs font-medium text-primary sm:text-sm">
                            Xem chi tiết
                            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
