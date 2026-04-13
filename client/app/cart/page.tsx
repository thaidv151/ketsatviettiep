'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_CART_ITEMS = [
  {
    id: 1,
    name: 'Executive Safe Pro',
    price: 2499,
    quantity: 1,
    image: '🔒',
    category: 'Office',
  },
  {
    id: 2,
    name: 'Home Guardian 500',
    price: 1299,
    quantity: 2,
    image: '🏠',
    category: 'Home',
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(SAMPLE_CART_ITEMS)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = cartItems.length > 0 ? 0 : 0
  const tax = Math.round(subtotal * 0.08)
  const total = subtotal + shipping + tax

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some premium safes to get started.</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Continue Shopping
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
                    key={item.id}
                    className="p-6 border-b border-border last:border-b-0 flex flex-col md:flex-row gap-6 items-start md:items-center"
                  >
                    {/* Product Image */}
                    <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-4xl">{item.image}</div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="font-semibold text-lg text-foreground hover:text-accent transition cursor-pointer">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                      <p className="text-lg font-bold text-foreground mt-2">
                        ${item.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-muted transition"
                        >
                          <Minus className="w-4 h-4 text-foreground" />
                        </button>
                        <span className="w-8 text-center text-foreground font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-muted transition"
                        >
                          <Plus className="w-4 h-4 text-foreground" />
                        </button>
                      </div>

                      <p className="font-bold text-foreground min-w-24 text-right">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>

                      <button
                        onClick={() => removeItem(item.id)}
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
                <Link href="/products">
                  <Button variant="outline" className="border-border hover:bg-muted">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border p-6 space-y-6 sticky top-20">
                <h3 className="text-xl font-bold text-foreground">Order Summary</h3>

                <div className="space-y-3 pb-6 border-b border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (estimated)</span>
                    <span>${tax.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-3xl font-bold text-foreground">
                    ${total.toLocaleString()}
                  </span>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="space-y-3 pt-6 border-t border-border text-sm">
                  <div className="flex gap-2">
                    <span>🔒</span>
                    <span className="text-muted-foreground">Secure checkout</span>
                  </div>
                  <div className="flex gap-2">
                    <span>🚚</span>
                    <span className="text-muted-foreground">Free delivery & installation</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span className="text-muted-foreground">Money-back guarantee</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
