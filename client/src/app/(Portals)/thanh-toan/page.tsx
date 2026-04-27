'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Banknote, Package, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { CartLine } from '@/types/cart'
import { cartLineKey } from '@/types/cart'
import { getAccessToken } from '@/services/auth/tokenStorage'
import { getProfileRequest } from '@/services/auth/authApi'
import { portalApi } from '@/services/portal.service'

const LOGIN_THANH_TOAN = '/dang-nhap?redirect=' + encodeURIComponent('/thanh-toan')

/** Họ: từ đầu; Tên: phần còn lại (định dạng VN: Nguyễn Văn An → Họ Nguyễn, Tên Văn An). */
function splitHoTen(fullName: string | null | undefined): { lastName: string; firstName: string } {
  const t = (fullName ?? '').trim()
  if (!t) return { lastName: '', firstName: '' }
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return { lastName: parts[0] ?? '', firstName: parts[0] ?? '' }
  }
  return { lastName: parts[0] ?? '', firstName: parts.slice(1).join(' ') }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string
    orderCode: string
    items: CartLine[]
    subtotal: number
    total: number
  } | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    /** Xã / phường (cấp dưới tỉnh, theo mô hình 2 cấp từ 7/2025) */
    ward: '',
    zipCode: '',
  })
  const profilePrefilled = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!getAccessToken()) {
      router.replace(LOGIN_THANH_TOAN)
      return
    }
    setAuthReady(true)
    setMounted(true)
    const saved = localStorage.getItem('ketsat_cart')
    if (saved) {
      try {
        setCartItems(JSON.parse(saved) as CartLine[])
      } catch (e) { }
    }
  }, [router])

  useEffect(() => {
    if (!authReady || profilePrefilled.current) return
    profilePrefilled.current = true
    getProfileRequest()
      .then((p) => {
        setFormData((prev) => ({
          ...prev,
          fullName: (p.fullName && p.fullName.trim()) || prev.fullName,
          email: (p.email && p.email.trim()) || prev.email,
          phone: (p.phoneNumber && p.phoneNumber.trim()) || prev.phone,
          address: (p.addressDetail && p.addressDetail.trim()) || prev.address,
          city: (p.province && p.province.trim()) || prev.city,
          ward: (p.ward && p.ward.trim()) || prev.ward,
        }))
      })
      .catch(() => {})
  }, [authReady])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
      return
    }
    if (cartItems.length === 0) {
      setSubmitError('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.')
      return
    }
    setSubmitError(null)
    setSubmitting(true)
    const snapSubtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0)
    const itemsPayload = cartItems.map((c) => ({
      productId: c.id,
      variantId: c.variantId && c.variantId.length > 0 ? c.variantId : null,
      quantity: c.quantity,
      price: c.price,
    }))
    try {
      const { firstName, lastName } = splitHoTen(formData.fullName)
      const res = await portalApi.createOrder({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        ward: formData.ward,
        zipCode: formData.zipCode,
        paymentMethod: 'cod',
        items: itemsPayload,
      })
      setOrderSuccess({
        orderId: res.orderId,
        orderCode: res.orderCode,
        items: cartItems.map((x) => ({ ...x })),
        subtotal: snapSubtotal,
        total: snapSubtotal,
      })
      setStep(3)
      setCartItems([])
      localStorage.removeItem('ketsat_cart')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'))
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null
      setSubmitError(
        typeof msg === 'string' && msg.length > 0
          ? msg
          : 'Không thể tạo đơn hàng. Vui lòng thử lại hoặc đăng nhập lại.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>

      <div className="border-b border-border bg-muted/80">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {step === 3 ? 'Hoàn tất đặt hàng' : 'Thanh toán'}
          </h1>
          {step === 3 && (
            <p className="mt-1 text-sm text-muted-foreground">Bạn đã hoàn tất bước thanh toán trên trang này.</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!mounted || !authReady ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
        ) : step === 3 && orderSuccess ? (
          <div className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.07] via-background to-background"
              aria-hidden
            />
            <div className="mx-auto max-w-2xl py-10 sm:py-14">
              <div className="mb-8 text-center sm:mb-10">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5 ring-offset-2 ring-offset-background sm:h-24 sm:w-24">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/25 sm:h-16 sm:w-16">
                    <Check className="h-8 w-8 text-primary-foreground sm:h-9 sm:w-9" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Hoàn tất</p>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Đặt hàng thành công!</h2>
                <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
                  Cảm ơn bạn đã mua tại <span className="font-medium text-foreground">Két sắt Việt Tiệp</span>. Đơn đã
                  ghi nhận; chúng tôi sẽ gọi xác nhận và giao hàng theo hình thức bạn chọn.
                </p>
              </div>

              <Card className="overflow-hidden border-border/80 bg-card/95 p-0 shadow-lg shadow-foreground/5 backdrop-blur-sm sm:rounded-2xl">
                <div className="border-b border-border/80 bg-muted/30 px-6 py-5 sm:px-8 sm:py-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mã đơn hàng</p>
                  <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                    #{orderSuccess.orderCode}
                  </p>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-7">
                  <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="h-4 w-4 text-primary" aria-hidden />
                    Sản phẩm
                  </div>
                  <ul className="space-y-0 divide-y divide-border/80" role="list">
                    {orderSuccess.items.map((item) => (
                      <li key={cartLineKey(item)} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border/80 bg-white p-1.5">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground/40">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="font-medium leading-snug text-foreground">{item.name}</p>
                          {item.variantLabel && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{item.variantLabel}</p>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                        </div>
                        <p className="flex-shrink-0 self-start font-semibold tabular-nums text-foreground">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 border-t border-border/80 bg-muted/20 px-6 py-5 sm:px-8">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Tạm tính</span>
                    <span className="tabular-nums text-foreground">
                      {orderSuccess.subtotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t-2 border-primary/20 bg-primary/5 px-6 py-5 sm:px-8">
                  <span className="text-base font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                    {orderSuccess.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </Card>

              {/* {formData.email ? (
                <div className="mt-6 flex items-start justify-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground sm:mt-8">
                  <Truck className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
                  <p>
                    Thông tin xác nhận sẽ gửi tới <span className="font-medium text-foreground">{formData.email}</span>
                    (giả lập gửi email khi tích hợp hệ thống).
                  </p>
                </div>
              ) : null} */}

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
                <Button variant="outline" className="h-12 w-full sm:min-w-44" asChild>
                  <Link href="/san-pham" className="inline-flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Tiếp tục mua sắm
                  </Link>
                </Button>
                <Button className="h-12 w-full sm:min-w-44" asChild>
                  <Link href="/don-hang" className="inline-flex items-center justify-center">
                    Xem đơn hàng của tôi
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : step === 3 && !orderSuccess ? (
          <div className="py-20 text-center text-muted-foreground">Đang tải…</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <ol className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Tiến trình thanh toán">
                <li
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                    step === 1
                      ? 'border-primary/30 bg-primary/5 font-medium text-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <span className="text-xs tabular-nums text-muted-foreground">1</span>
                  Giao hàng
                </li>
                <li className="self-center text-muted-foreground" aria-hidden>
                  →
                </li>
                <li
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                    step === 2
                      ? 'border-primary/30 bg-primary/5 font-medium text-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <span className="text-xs tabular-nums text-muted-foreground">2</span>
                  Thanh toán
                </li>
              </ol>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <Card className="border-border bg-card p-6 sm:p-8">
                    <h2 className="mb-1 text-2xl font-bold text-foreground">Thông tin giao hàng</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Vui lòng điền chính xác để giao hàng nhanh chóng.</p>

                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          autoComplete="name"
                          className="h-10"
                          placeholder="Ví dụ: Nguyễn Văn An"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          autoComplete="email"
                          className="h-10"
                          placeholder="ten@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          autoComplete="tel"
                          inputMode="tel"
                          className="h-10"
                          placeholder="Ví dụ: 0901 234 567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Địa chỉ nhận hàng</Label>
                        <Input
                          id="address"
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          autoComplete="street-address"
                          className="h-10"
                          placeholder="Số nhà, tên đường, ngõ hẻm"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">Tỉnh / Thành phố</Label>
                          <Input
                            id="city"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            autoComplete="address-level1"
                            className="h-10"
                            placeholder="Ví dụ: Tỉnh Bắc Ninh"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ward">Xã / Phường</Label>
                          <Input
                            id="ward"
                            type="text"
                            name="ward"
                            value={formData.ward}
                            onChange={handleInputChange}
                            required
                            autoComplete="address-level2"
                            className="h-10"
                            placeholder="Ví dụ: Phường Hồng Hà, xã Tân Dân"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="zipCode">Mã bưu chính (nếu biết)</Label>
                          <Input
                            id="zipCode"
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            autoComplete="postal-code"
                            inputMode="numeric"
                            className="h-10"
                            placeholder="Ví dụ: 100000"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <Card className="border-border bg-card p-6 sm:p-8">
                    {submitError && (
                      <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {submitError}
                      </p>
                    )}
                    <h2 className="mb-1 text-2xl font-bold text-foreground">Phương thức thanh toán</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                      Tạm thời website chỉ hỗ trợ thanh toán bằng tiền mặt khi nhận hàng. Thanh toán thẻ và chuyển khoản sẽ được
                      cập nhật sau.
                    </p>
                    <div
                      className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 ring-1 ring-primary/20"
                      role="status"
                    >
                      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <Banknote className="h-4 w-4" aria-hidden />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Tiền mặt khi nhận hàng (COD)</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vui lòng chuẩn bị đủ số tiền theo tổng cộng bên phải; nhân viên giao hàng sẽ thu khi bạn kiểm tra hàng
                          hóa.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  {step === 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-11 w-full font-semibold sm:w-auto sm:min-w-36"
                    >
                      Quay lại
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="h-11 flex-1 font-semibold"
                    disabled={submitting}
                  >
                    {step === 1
                      ? 'Tiếp tục thanh toán'
                      : submitting
                        ? 'Đang xử lý...'
                        : 'Xác nhận đặt hàng'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 space-y-6 border-border bg-card p-6">
                <h3 className="text-lg font-bold text-foreground sm:text-xl">Tóm tắt đơn hàng</h3>

                <div className="max-h-64 space-y-4 overflow-y-auto border-b border-border pb-6">
                  {cartItems.map((item) => (
                    <div key={cartLineKey(item)} className="flex justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-border bg-white p-1">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-lg" aria-hidden>
                              🔒
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-foreground">{item.name}</p>
                          {item.variantLabel && (
                            <p className="text-xs text-muted-foreground">{item.variantLabel}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-sm font-bold text-foreground tabular-nums">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tạm tính</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {subtotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-lg font-bold text-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold text-foreground tabular-nums sm:text-3xl">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

    </main>
  )
}
