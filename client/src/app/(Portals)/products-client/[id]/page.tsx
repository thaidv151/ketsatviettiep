'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Check, Star } from 'lucide-react'
import Link from 'next/link'

const ALL_PRODUCTS = [
  { id: 1, name: 'Executive Safe Pro', price: 2499, originalPrice: 2999, category: 'Office', rating: 4.9, reviews: 248, image: '🔒', lockType: 'Biometric', size: 'Large', description: 'Professional-grade safe for executive offices with biometric access and fireproof protection.', specs: { weight: '150 kg', material: 'Steel', warranty: '10 years', features: ['Biometric lock', 'Fireproof', 'Waterproof', 'Silent opening'] } },
  { id: 2, name: 'Home Guardian 500', price: 1299, originalPrice: 1599, category: 'Home', rating: 4.8, reviews: 192, image: '🏠', lockType: 'Digital', size: 'Medium', description: 'Perfect for home storage with digital keypad and reliable protection.', specs: { weight: '80 kg', material: 'Steel', warranty: '7 years', features: ['Digital keypad', 'Emergency backup key', 'Interior light', 'Adjustable shelves'] } },
  { id: 3, name: 'Fireproof Elite', price: 3499, originalPrice: 3999, category: 'Fireproof', rating: 4.9, reviews: 156, image: '🔥', lockType: 'Mechanical', size: 'Large', description: 'Maximum protection against fire and theft with premium mechanical locking system.', specs: { weight: '200 kg', material: 'Steel + Fireproof material', warranty: '15 years', features: ['Fireproof rated', 'Mechanical lock', 'Heavy duty construction', 'Anti-drill plate'] } },
  { id: 4, name: 'Digital Smart Safe', price: 1899, originalPrice: 2199, category: 'Digital', rating: 4.7, reviews: 128, image: '📱', lockType: 'Biometric', size: 'Medium', description: 'Smart safe with mobile app integration and biometric authentication.', specs: { weight: '90 kg', material: 'Steel', warranty: '8 years', features: ['App control', 'Biometric scanner', 'Battery backup', 'Alarm system'] } },
  { id: 5, name: 'Compact Home Safe', price: 599, originalPrice: 799, category: 'Home', rating: 4.6, reviews: 89, image: '🏠', lockType: 'Key', size: 'Small', description: 'Compact safe ideal for apartments and small homes with key lock.', specs: { weight: '25 kg', material: 'Steel', warranty: '5 years', features: ['Lightweight', 'Key lock', 'Wall mountable', 'Budget-friendly'] } },
  { id: 6, name: 'Office Wall Safe', price: 1199, originalPrice: 1499, category: 'Office', rating: 4.8, reviews: 142, image: '🔒', lockType: 'Digital', size: 'Small', description: 'Wall-mounted safe perfect for office documents and valuables.', specs: { weight: '40 kg', material: 'Steel', warranty: '7 years', features: ['Wall mount', 'Digital keypad', 'Compact design', 'Professional look'] } },
  { id: 7, name: 'Fireproof Standard', price: 2199, originalPrice: 2599, category: 'Fireproof', rating: 4.7, reviews: 95, image: '🔥', lockType: 'Mechanical', size: 'Medium', description: 'Reliable fireproof protection for medium-sized valuables.', specs: { weight: '120 kg', material: 'Steel + Fireproof material', warranty: '10 years', features: ['Fireproof rated', 'Mechanical lock', 'Interior LED', 'Document pockets'] } },
  { id: 8, name: 'Smart Vault Pro', price: 2799, originalPrice: 3199, category: 'Digital', rating: 4.9, reviews: 201, image: '📱', lockType: 'Biometric', size: 'Large', description: 'Premium smart vault with advanced security features and IoT connectivity.', specs: { weight: '160 kg', material: 'Steel', warranty: '10 years', features: ['IoT enabled', 'Biometric + PIN', 'Cloud backup', 'Remote monitoring'] } },
  { id: 9, name: 'Residential Safe', price: 899, originalPrice: 1099, category: 'Home', rating: 4.5, reviews: 76, image: '🏠', lockType: 'Key', size: 'Medium', description: 'Sturdy residential safe for family valuables and documents.', specs: { weight: '70 kg', material: 'Steel', warranty: '6 years', features: ['Key lock', 'Hidden hinges', 'Carpeted floor', 'Interior organizer'] } },
  { id: 10, name: 'Executive Wall Mount', price: 1699, originalPrice: 1999, category: 'Office', rating: 4.7, reviews: 118, image: '🔒', lockType: 'Digital', size: 'Medium', description: 'Executive wall-mounted safe with digital lock and professional design.', specs: { weight: '85 kg', material: 'Steel', warranty: '8 years', features: ['Wall mount', 'Digital keypad', 'Sleek design', 'Quick access'] } },
  { id: 11, name: 'Heavy Duty Fireproof', price: 4499, originalPrice: 4999, category: 'Fireproof', rating: 5, reviews: 187, image: '🔥', lockType: 'Biometric', size: 'Large', description: 'Top-tier fireproof safe with biometric lock and maximum protection.', specs: { weight: '250 kg', material: 'Steel + Advanced fireproof', warranty: '20 years', features: ['Premium fireproof', 'Biometric lock', 'Anchor bolts', 'Insurance approved'] } },
  { id: 12, name: 'IoT Smart Safe', price: 3299, originalPrice: 3799, category: 'Digital', rating: 4.8, reviews: 164, image: '📱', lockType: 'Biometric', size: 'Large', description: 'Latest IoT smart safe with full automation and integration capabilities.', specs: { weight: '170 kg', material: 'Steel', warranty: '10 years', features: ['Full IoT control', 'Biometric scanner', 'Temporal access', 'Audit logs'] } },
]

const REVIEWS = [
  { id: 1, author: 'John Doe', rating: 5, text: 'Excellent safe! Very secure and well-built.', date: '2024-01-15' },
  { id: 2, author: 'Jane Smith', rating: 5, text: 'Great quality and fast delivery. Highly recommend!', date: '2024-01-10' },
  { id: 3, author: 'Mike Johnson', rating: 4, text: 'Good safe, but installation was a bit tricky.', date: '2024-01-05' },
  { id: 4, author: 'Sarah Williams', rating: 5, text: 'Perfect for my home office. Feel very safe now.', date: '2023-12-28' },
]

export default function ProductDetail() {
  const params = useParams()
  const id = parseInt(params.id as string)
  const product = ALL_PRODUCTS.find(p => p.id === id)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
              <Link href="/products">
                <Button>Back to Products</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-card rounded-lg p-12 min-h-96">
              <div className="text-9xl">{product.image}</div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-3 hover:bg-muted rounded-full transition"
                >
                  <Heart
                    size={24}
                    className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                  />
                </button>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl font-bold text-primary">${product.price.toLocaleString()}</span>
                  <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toLocaleString()}</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Save ${(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-8">{product.description}</p>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-card rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Lock Type</p>
                  <p className="font-semibold">{product.lockType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-semibold">{product.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold">{product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{product.specs.weight}</p>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition"
                  >
                    -
                  </button>
                  <span className="px-6 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition"
                  >
                    +
                  </button>
                </div>
                <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90">
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-3 border-t pt-8">
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-primary" />
                  <span className="text-sm">Free shipping on orders over $1000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-primary" />
                  <span className="text-sm">30-day money back guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={20} className="text-primary" />
                  <span className="text-sm">{product.specs.warranty} warranty included</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8">
            <div className="flex gap-8">
              {['description', 'specs', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">About this product</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    This {product.category.toLowerCase()} safe is designed with premium materials and craftsmanship. 
                    It provides reliable protection for your most valued possessions. With {product.specs.features.length} key features including {product.specs.features.slice(0, 2).join(', ')}, 
                    you can trust this safe to keep your valuables secure.
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">Specifications</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium">Lock Type:</span>
                      <span className="text-muted-foreground">{product.lockType}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium">Size:</span>
                      <span className="text-muted-foreground">{product.size}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium">Weight:</span>
                      <span className="text-muted-foreground">{product.specs.weight}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium">Material:</span>
                      <span className="text-muted-foreground">{product.specs.material}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="font-medium">Warranty:</span>
                      <span className="text-muted-foreground">{product.specs.warranty}</span>
                    </div>
                    <div className="py-3">
                      <span className="font-medium block mb-3">Features:</span>
                      <ul className="space-y-2">
                        {product.specs.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                            <Check size={16} className="text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                  <div className="flex items-center gap-4 mb-8 p-6 bg-card rounded-lg">
                    <div>
                      <div className="text-4xl font-bold text-primary mb-2">{product.rating}</div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">Based on {product.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {REVIEWS.map(review => (
                      <Card key={review.id} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="h-fit sticky top-24 space-y-4">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-bold mb-3 text-primary">Why Choose This Safe?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {product.specs.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check size={16} className="text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-3">Price Match Guarantee</h3>
                <p className="text-sm text-muted-foreground">Found a lower price? We&apos;ll match it or beat it by 5%.</p>
              </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
