'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Heart, ShoppingCart, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const ALL_PRODUCTS = [
  { id: 1, name: 'Executive Safe Pro', price: 2499, originalPrice: 2999, category: 'Office', rating: 4.9, reviews: 248, image: '🔒', lockType: 'Biometric', size: 'Large' },
  { id: 2, name: 'Home Guardian 500', price: 1299, originalPrice: 1599, category: 'Home', rating: 4.8, reviews: 192, image: '🏠', lockType: 'Digital', size: 'Medium' },
  { id: 3, name: 'Fireproof Elite', price: 3499, originalPrice: 3999, category: 'Fireproof', rating: 4.9, reviews: 156, image: '🔥', lockType: 'Mechanical', size: 'Large' },
  { id: 4, name: 'Digital Smart Safe', price: 1899, originalPrice: 2199, category: 'Digital', rating: 4.7, reviews: 128, image: '📱', lockType: 'Biometric', size: 'Medium' },
  { id: 5, name: 'Compact Home Safe', price: 599, originalPrice: 799, category: 'Home', rating: 4.6, reviews: 89, image: '🏠', lockType: 'Key', size: 'Small' },
  { id: 6, name: 'Office Wall Safe', price: 1199, originalPrice: 1499, category: 'Office', rating: 4.8, reviews: 142, image: '🔒', lockType: 'Digital', size: 'Small' },
  { id: 7, name: 'Fireproof Standard', price: 2199, originalPrice: 2599, category: 'Fireproof', rating: 4.7, reviews: 95, image: '🔥', lockType: 'Mechanical', size: 'Medium' },
  { id: 8, name: 'Smart Vault Pro', price: 2799, originalPrice: 3199, category: 'Digital', rating: 4.9, reviews: 201, image: '📱', lockType: 'Biometric', size: 'Large' },
  { id: 9, name: 'Residential Safe', price: 899, originalPrice: 1099, category: 'Home', rating: 4.5, reviews: 76, image: '🏠', lockType: 'Key', size: 'Medium' },
  { id: 10, name: 'Executive Wall Mount', price: 1699, originalPrice: 1999, category: 'Office', rating: 4.7, reviews: 118, image: '🔒', lockType: 'Digital', size: 'Medium' },
  { id: 11, name: 'Heavy Duty Fireproof', price: 4499, originalPrice: 4999, category: 'Fireproof', rating: 5, reviews: 187, image: '🔥', lockType: 'Biometric', size: 'Large' },
  { id: 12, name: 'IoT Smart Safe', price: 3299, originalPrice: 3799, category: 'Digital', rating: 4.8, reviews: 164, image: '📱', lockType: 'Biometric', size: 'Large' },
]

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('popular')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLockType, setSelectedLockType] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = ALL_PRODUCTS.filter(product => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
      const matchesLockType = selectedLockType === 'All' || product.lockType === selectedLockType
      const matchesSize = selectedSize === 'All' || product.size === selectedSize
      return matchesPrice && matchesCategory && matchesLockType && matchesSize
    })

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'newest') {
      filtered.reverse()
    }

    return filtered
  }, [sortBy, priceRange, selectedCategory, selectedLockType, selectedSize])

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Our Safes</h1>
          <p className="text-muted-foreground mt-2">{filteredAndSortedProducts.length} products found</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Category</h3>
              <div className="space-y-2">
                {['All', 'Home', 'Office', 'Fireproof', 'Digital'].map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-foreground">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Lock Type</h3>
              <div className="space-y-2">
                {['All', 'Biometric', 'Digital', 'Mechanical', 'Key'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="lockType"
                      value={type}
                      checked={selectedLockType === type}
                      onChange={() => setSelectedLockType(type)}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-foreground">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Size</h3>
              <div className="space-y-2">
                {['All', 'Small', 'Medium', 'Large'].map((size) => (
                  <label key={size} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={selectedSize === size}
                      onChange={() => setSelectedSize(size)}
                      className="w-4 h-4 accent-accent"
                    />
                    <span className="text-foreground">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
              <p className="text-muted-foreground">
                Showing {filteredAndSortedProducts.length} products
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 text-foreground pr-10 cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card border-border h-full cursor-pointer">
                      <div className="relative h-64 bg-muted flex items-center justify-center">
                        <div className="text-6xl">{product.image}</div>
                        <button className="absolute top-4 left-4 p-2 bg-background/80 hover:bg-background rounded-lg transition backdrop-blur-sm">
                          <Heart className="w-5 h-5 text-muted-foreground hover:text-accent transition" />
                        </button>
                      </div>

                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating) ? 'text-accent' : 'text-muted'}>★</span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({product.reviews})</span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-foreground">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        </div>

                        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
