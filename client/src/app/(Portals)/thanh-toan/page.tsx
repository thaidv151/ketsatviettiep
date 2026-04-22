'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import Link from 'next/link'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string | null
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('ketsat_cart')
    if (saved) {
      try {
        setCartItems(JSON.parse(saved))
      } catch (e) { }
    }
  }, [])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card',
  })

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      setStep(2)
    } else {
      // In a real app, process payment and create order
      setStep(3)
      localStorage.removeItem('ketsat_cart')
    }
  }

  return (
    <main>

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Thanh toán</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!mounted ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
        ) : step === 3 ? (
          // Order Confirmation
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-6">
              <Check className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Đặt hàng thành công!</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý sớm nhất.
            </p>

            <Card className="bg-card border-border p-8 mb-8 space-y-6 text-left">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-foreground">#ORD-2024-001234</p>
              </div>

              <div className="border-t border-border pt-6">
                <p className="text-sm text-muted-foreground mb-4">Sản phẩm</p>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-foreground">{item.name} x {item.quantity}</span>
                      <span className="font-semibold text-foreground">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Thuế</span>
                  <span>{tax.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-2 mt-2">
                  <span>Tổng cộng</span>
                  <span>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </Card>

            <p className="text-muted-foreground mb-8">
              Email xác nhận đã được gửi đến {formData.email}
            </p>

            <Link href="/don-hang">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Xem đơn hàng của tôi
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Shipping */}
                {step === 1 && (
                  <Card className="bg-card border-border p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Thông tin giao hàng</h2>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Tên
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Họ
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                        placeholder="(555) 000-0000"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Thành phố / Tỉnh
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Quận / Huyện
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Mã bưu điện (Zip Code)
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:border-accent"
                          placeholder="10001"
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <Card className="bg-card border-border p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Phương thức thanh toán</h2>

                    <div className="space-y-4 mb-8">
                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-accent"
                        />
                        <span className="ml-3 text-foreground font-semibold">Thẻ Tín dụng/Ghi nợ</span>
                      </label>

                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={formData.paymentMethod === 'bank'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-accent"
                        />
                        <span className="ml-3 text-foreground font-semibold">Chuyển khoản Ngân hàng</span>
                      </label>

                      <label className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-accent"
                        />
                        <span className="ml-3 text-foreground font-semibold">Thanh toán khi nhận hàng (COD)</span>
                      </label>
                    </div>

                    {formData.paymentMethod === 'card' && (
                      <div className="bg-muted p-4 rounded-lg text-muted-foreground text-sm">
                        Chi tiết thẻ sẽ được nhập ở đây (tích hợp xử lý thanh toán)
                      </div>
                    )}
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition font-semibold"
                    >
                      Quay lại
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition"
                  >
                    {step === 1 ? 'Tiếp tục thanh toán' : 'Đặt hàng'}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border p-6 space-y-6 sticky top-20">
                <h3 className="text-xl font-bold text-foreground">Tóm tắt đơn hàng</h3>

                <div className="space-y-4 pb-6 border-b border-border">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-white rounded flex items-center justify-center flex-shrink-0 p-1 border border-border">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xl">🔒</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">SL: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Phí vận chuyển</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Thuế</span>
                    <span>{tax.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <span className="text-lg font-bold text-foreground">Tổng cộng</span>
                  <span className="text-3xl font-bold text-foreground">
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
