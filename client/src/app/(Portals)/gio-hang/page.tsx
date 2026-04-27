'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import type { CartLine } from '@/types/cart'
import { cartLineKey } from '@/types/cart'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartLine[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('ketsat_cart')
    if (saved) {
      try {
        const raw = JSON.parse(saved) as CartLine[]
        setCartItems(
          raw.map((c) => ({
            ...c,
            slug: c.slug || c.id,
            variantId: c.variantId ?? null,
            variantLabel: c.variantLabel ?? null,
            variantSku: c.variantSku ?? null,
          })),
        )
      } catch (e) {
        console.error('Invalid cart JSON in localStorage')
      }
    }
  }, [])

  const saveCart = (items: CartLine[]) => {
    setCartItems(items)
    localStorage.setItem('ketsat_cart', JSON.stringify(items))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const updateQuantity = (key: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(key)
      return
    }
    const updated = cartItems.map((item) =>
      cartLineKey(item) === key ? { ...item, quantity: newQuantity } : item
    )
    saveCart(updated)
  }

  const removeItem = (key: string) => {
    saveCart(cartItems.filter((item) => cartLineKey(item) !== key))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const total = subtotal

  return (
    <main>

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Giỏ Hàng Của Bạn</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!mounted ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Giỏ hàng của bạn đang trống</h2>
            <p className="text-muted-foreground mb-8">Hãy thêm các sản phẩm tuyệt vời của chúng tôi vào giỏ hàng.</p>
            <Link href="/san-pham">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                {cartItems.map((item) => (
                  <div
                    key={cartLineKey(item)}
                    className="p-6 border-b border-border last:border-b-0 flex flex-col md:flex-row gap-6 items-start md:items-center"
                  >
                    {/* Product Image */}
                    <div className="h-24 w-24 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2 border border-border">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-4xl">🔒</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <Link href={`/san-pham/${encodeURIComponent(item.slug || item.id)}`}>
                        <h3 className="font-semibold text-lg text-foreground hover:text-accent transition cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                      {item.variantId ? (
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                            Mã phân loại
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {item.variantLabel ||
                              (item.variantSku ? `Mã: ${item.variantSku}` : '—')}
                          </p>
                          {item.variantSku &&
                            item.variantLabel &&
                            item.variantSku.trim() !== item.variantLabel.trim() && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-mono">SKU: {item.variantSku}</span>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Sản phẩm mặc định — không theo mã phân loại
                        </p>
                      )}
                      {item.category != null && item.category !== '' && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.category}</p>
                      )}
                      <p className="text-lg font-bold text-foreground mt-2">
                        {item.price.toLocaleString()}đ
                      </p>
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(cartLineKey(item), item.quantity - 1)}
                          className="p-2 hover:bg-muted transition"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="w-8 text-center text-foreground font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartLineKey(item), item.quantity + 1)}
                          className="p-2 hover:bg-muted transition"
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>

                      <p className="font-bold text-foreground min-w-24 text-right">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </p>

                      <button
                        onClick={() => removeItem(cartLineKey(item))}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/san-pham">
                  <Button variant="outline" className="border-border hover:bg-muted">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border p-6 space-y-6 sticky top-20">
                <h3 className="text-xl font-bold text-foreground">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <span className="text-lg font-bold text-foreground">Tổng cộng</span>
                  <span className="text-3xl font-bold text-foreground">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <Link href="/thanh-toan" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold">
                    Tiến hành thanh toán
                  </Button>
                </Link>

                {/* Trust Badges */}
                {/* <div className="space-y-3 pt-6 border-t border-border text-sm">
                  <div className="flex gap-2">
                    <span>🔒</span>
                    <span className="text-muted-foreground">Thanh toán bảo mật</span>
                  </div>
                  <div className="flex gap-2">
                    <span>🚚</span>
                    <span className="text-muted-foreground">Miễn phí giao hàng & lắp đặt</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span className="text-muted-foreground">Cam kết hoàn tiền</span>
                  </div>
                </div> */}
              </Card>
            </div>
          </div>
        )}
      </div>

    </main>
  )
}
