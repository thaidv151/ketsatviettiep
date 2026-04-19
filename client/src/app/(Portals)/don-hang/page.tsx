'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Check, Truck, Clock } from 'lucide-react'
import Link from 'next/link'
import { portalApi, PortalOrderDto } from '@/services/portal.service'
import React from 'react'

const getStatusColor = (status: number) => {
  switch (status) {
    case 4: // Delivered
      return 'text-blue-600 dark:text-blue-400'
    case 3: // Shipped
      return 'text-blue-600 dark:text-blue-400'
    case 0: // Pending
    case 1:
    case 2:
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-muted-foreground'
  }
}

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PortalOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all')


  React.useEffect(() => {
    portalApi.getOrders()
      .then(data => {
        setOrders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])


  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => {
      if (activeTab === 'pending') return order.status < 3
      if (activeTab === 'shipped') return order.status === 3
      if (activeTab === 'delivered') return order.status === 4
      return true
    })

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Đơn Hàng Của Tôi</h1>
          <p className="text-muted-foreground mt-2">{filteredOrders.length} đơn hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-muted text-foreground'
              }`}
          >
            <span>Tất cả</span>
            <span className="text-sm opacity-75">({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-muted text-foreground'
              }`}
          >
            <Clock size={18} />
            <span>Chờ xử lý</span>
            <span className="text-sm opacity-75">({orders.filter(o => o.status < 3).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipped')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'shipped'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-muted text-foreground'
              }`}
          >
            <Truck size={18} />
            <span>Đang giao</span>
            <span className="text-sm opacity-75">({orders.filter(o => o.status === 3).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'delivered'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card hover:bg-muted text-foreground'
              }`}
          >
            <Check size={18} />
            <span>Đã giao</span>
            <span className="text-sm opacity-75">({orders.filter(o => o.status === 4).length})</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Chưa có đơn hàng nào</h2>
            <p className="text-muted-foreground mb-8">Bắt đầu mua sắm để thấy đơn hàng của bạn ở đây.</p>
            <Link href="/san-pham">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Order Header */}
                <button
                  onClick={() =>
                    setExpandedOrder(expandedOrder === order.id ? null : order.id)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition"
                >
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {order.orderCode}
                      </h3>
                      <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-bold text-foreground">
                      {order.totalAmount.toLocaleString()}đ
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-90' : ''
                      }`}
                  />
                </button>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-border p-6 space-y-6 bg-muted/30">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Sản phẩm</h4>
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">Chi tiết sản phẩm sẽ được lấy từ API get detail. Ở đây chỉ hiển thị tóm tắt {order.itemCount} sản phẩm.</p>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold text-foreground mb-4">Thông tin giao hàng</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Ngày nhận dự kiến
                          </p>
                          <p className="font-semibold text-foreground">
                            N/A
                          </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Mã vận đơn
                          </p>
                          <p className="font-semibold text-foreground font-mono">
                            N/A
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold text-foreground mb-4">Tổng quan đơn hàng</h4>
                      <div className="space-y-2 bg-background p-4 rounded-lg">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tạm tính</span>
                          <span>
                            {Math.round(order.totalAmount / 1.08).toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Phí vận chuyển</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            Miễn phí
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Thuế</span>
                          <span>
                            {Math.round(order.totalAmount * 0.08).toLocaleString()}đ
                          </span>
                        </div>
                        <div className="flex justify-between text-foreground font-bold border-t border-border pt-2 mt-2">
                          <span>Tổng cộng</span>
                          <span>{order.totalAmount.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border pt-6 flex gap-4">
                      <Link href="/san-pham" className="flex-1">
                        <Button variant="outline" className="w-full border-border hover:bg-muted">
                          Tiếp tục mua sắm
                        </Button>
                      </Link>
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Theo dõi đơn hàng
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
