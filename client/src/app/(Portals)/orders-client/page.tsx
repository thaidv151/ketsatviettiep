'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, Check, Truck, Clock } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_ORDERS = [
  {
    id: 'ORD-2024-001234',
    date: 'Jan 15, 2024',
    status: 'delivered',
    items: [
      { name: 'Executive Safe Pro', quantity: 1, price: 2499, image: '🔒' },
      { name: 'Home Guardian 500', quantity: 2, price: 1299, image: '🏠' },
    ],
    total: 5097,
    estimatedDelivery: 'Jan 18, 2024',
    trackingNumber: 'USPS-2024-123456',
  },
  {
    id: 'ORD-2024-001235',
    date: 'Jan 22, 2024',
    status: 'shipped',
    items: [
      { name: 'Digital Smart Safe', quantity: 1, price: 1899, image: '📱' },
    ],
    total: 1899,
    estimatedDelivery: 'Jan 28, 2024',
    trackingNumber: 'FDX-2024-987654',
  },
  {
    id: 'ORD-2024-001233',
    date: 'Jan 8, 2024',
    status: 'delivered',
    items: [
      { name: 'Fireproof Elite', quantity: 1, price: 3499, image: '🔥' },
    ],
    total: 3499,
    estimatedDelivery: 'Jan 12, 2024',
    trackingNumber: 'UPS-2024-654321',
  },
  {
    id: 'ORD-2024-001236',
    date: 'Jan 25, 2024',
    status: 'pending',
    items: [
      { name: 'Smart Vault Pro', quantity: 1, price: 2799, image: '📱' },
    ],
    total: 2799,
    estimatedDelivery: 'Feb 2, 2024',
    trackingNumber: 'PENDING-2024',
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'text-blue-600 dark:text-blue-400'
    case 'shipped':
      return 'text-blue-600 dark:text-blue-400'
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-muted-foreground'
  }
}

const getStatusLabel = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export default function OrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all')

  const filteredOrders = activeTab === 'all' 
    ? SAMPLE_ORDERS 
    : SAMPLE_ORDERS.filter(order => order.status === activeTab)

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-2">{filteredOrders.length} orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted text-foreground'
            }`}
          >
            <span>All Orders</span>
            <span className="text-sm opacity-75">({SAMPLE_ORDERS.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Clock size={18} />
            <span>Pending</span>
            <span className="text-sm opacity-75">({SAMPLE_ORDERS.filter(o => o.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipped')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'shipped'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Truck size={18} />
            <span>Shipped</span>
            <span className="text-sm opacity-75">({SAMPLE_ORDERS.filter(o => o.status === 'shipped').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delivered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === 'delivered'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card hover:bg-muted text-foreground'
            }`}
          >
            <Check size={18} />
            <span>Delivered</span>
            <span className="text-sm opacity-75">({SAMPLE_ORDERS.filter(o => o.status === 'delivered').length})</span>
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">Start shopping to see your orders here.</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Start Shopping
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
                        {order.id}
                      </h3>
                      <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ordered on {order.date}
                    </p>
                  </div>

                  <div className="text-right mr-4">
                    <p className="font-bold text-foreground">
                      ${order.total.toLocaleString()}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                      expandedOrder === order.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Order Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-border p-6 space-y-6 bg-muted/30">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 pb-3 border-b border-border last:border-b-0"
                          >
                            <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl">{item.image}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-foreground">
                                ${(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold text-foreground mb-4">Delivery Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Estimated Delivery
                          </p>
                          <p className="font-semibold text-foreground">
                            {order.estimatedDelivery}
                          </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">
                            Tracking Number
                          </p>
                          <p className="font-semibold text-foreground font-mono">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-border pt-6">
                      <h4 className="font-semibold text-foreground mb-4">Order Summary</h4>
                      <div className="space-y-2 bg-background p-4 rounded-lg">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>
                            ${Math.round(order.total / 1.08).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Shipping</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            Free
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tax</span>
                          <span>
                            ${Math.round(order.total * 0.08).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-foreground font-bold border-t border-border pt-2 mt-2">
                          <span>Total</span>
                          <span>${order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-border pt-6 flex gap-4">
                      <Link href="/products" className="flex-1">
                        <Button variant="outline" className="w-full border-border hover:bg-muted">
                          Continue Shopping
                        </Button>
                      </Link>
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Track Order
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
