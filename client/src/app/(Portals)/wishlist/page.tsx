'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Link from 'next/link'

const SAMPLE_WISHLIST_ITEMS = [
  {
    id: 1,
    name: 'Executive Safe Pro',
    price: 2499,
    originalPrice: 2999,
    rating: 4.9,
    reviews: 248,
    image: '🔒',
    category: 'Office',
  },
  {
    id: 3,
    name: 'Fireproof Elite',
    price: 3499,
    originalPrice: 3999,
    rating: 4.9,
    reviews: 156,
    image: '🔥',
    category: 'Fireproof',
  },
  {
    id: 8,
    name: 'Smart Vault Pro',
    price: 2799,
    originalPrice: 3199,
    rating: 4.9,
    reviews: 201,
    image: '📱',
    category: 'Digital',
  },
]

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState(SAMPLE_WISHLIST_ITEMS)

  const removeFromWishlist = (id: number) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id))
  }

  const addToCart = (id: number) => {
    // In a real app, this would add to cart
    console.log(`Added item ${id} to cart`)
  }

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground mt-2">{wishlistItems.length} items saved</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-8">Start adding your favorite safes to save them for later.</p>
            <Link href="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wishlist Items */}
            {wishlistItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Product Image */}
                  <div className="h-32 w-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-6xl">{item.image}</div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow space-y-2">
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="text-xl font-semibold text-foreground hover:text-accent transition cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-accent">★</span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({item.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        ${item.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${item.originalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto flex flex-col gap-3 md:flex-col">
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full bg-background border border-border hover:border-destructive hover:text-destructive text-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Summary and Actions */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Total Wishlist Value
                </h3>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-1">If all items purchased:</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString()}
                  </p>
                </div>
                <Link href="/products">
                  <Button variant="outline" className="border-border hover:bg-muted w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
