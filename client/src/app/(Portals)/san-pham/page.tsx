'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Heart, ShoppingCart, ChevronDown, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { portalApi, PortalProductDto } from '@/services/portal.service'
import { getFullImagePath } from '@/lib/path-utils'
import React from 'react'
import { Button } from 'antd'

export default function ProductsPage() {
  const [products, setProducts] = useState<PortalProductDto[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await portalApi.getProducts()
      setProducts(data)

      // Load wishlist
      const savedWishlist = localStorage.getItem('ketsat_wishlist')
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist))
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = (productId: string) => {
    let newWishlist = [...wishlist]
    const index = newWishlist.indexOf(productId)

    if (index > -1) {
      newWishlist.splice(index, 1)
      toast({
        title: 'Đã xóa khỏi yêu thích',
        description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.',
      })
    } else {
      newWishlist.push(productId)
      toast({
        variant: 'success',
        title: 'Đã thêm vào yêu thích',
        description: 'Sản phẩm đã được thêm vào danh sách yêu thích của bạn.',
      })
    }

    setWishlist(newWishlist)
    localStorage.setItem('ketsat_wishlist', JSON.stringify(newWishlist))
  }

  const addToCart = (e: React.MouseEvent, product: PortalProductDto) => {
    e.preventDefault()
    e.stopPropagation()

    const saved = localStorage.getItem('ketsat_cart')
    let cart = saved ? JSON.parse(saved) : []

    const existingIndex = cart.findIndex((item: any) => item.id === product.id)
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.salePrice ?? product.basePrice ?? 0,
        quantity: 1,
        image: product.thumbnailUrl,
        category: product.categoryName
      })
    }

    localStorage.setItem('ketsat_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))

    toast({
      variant: 'success',
      title: 'Đã thêm vào giỏ hàng',
      description: `Sản phẩm ${product.name} đã được thêm thành công.`,
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [sortBy, setSortBy] = useState('popular')
  const [priceRange, setPriceRange] = useState([0, 50000000])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLockType, setSelectedLockType] = useState('All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [visibleCount, setVisibleCount] = useState(20)

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const price = product.salePrice || product.basePrice || 0
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]
      const matchesCategory = selectedCategory === 'All' || product.categoryName === selectedCategory
      // lockType and size are not currently mapped, so ignore for now
      return matchesPrice && matchesCategory
    })

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.salePrice || a.basePrice || 0) - (b.salePrice || b.basePrice || 0))
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.salePrice || b.basePrice || 0) - (a.salePrice || a.basePrice || 0))
    } else if (sortBy === 'newest') {
      filtered.reverse()
    }

    return filtered
  }, [products, sortBy, priceRange, selectedCategory, selectedLockType, selectedSize])

  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, visibleCount)
  }, [filteredAndSortedProducts, visibleCount])

  const hasMore = filteredAndSortedProducts.length > visibleCount

  return (
    <main>
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Sản Phẩm Của Chúng Tôi</h1>
          <p className="text-muted-foreground mt-2">Tìm thấy {filteredAndSortedProducts.length} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Khoảng giá</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="50000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Danh mục</h3>
              <div className="space-y-2">
                {['Tất cả', 'Két Sắt Gia Đình', 'Két Sắt Công Ty', 'Két Sắt Chống Cháy', 'Két Sắt Mini', 'Ổ Khóa Cửa'].map((cat) => (
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
              <h3 className="font-semibold text-foreground mb-4">Loại khóa</h3>
              <div className="space-y-2">
                {['Tất cả', 'Vân tay', 'Điện tử', 'Cơ', 'Chìa'].map((type) => (
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
              <h3 className="font-semibold text-foreground mb-4">Kích thước</h3>
              <div className="space-y-2">
                {['Tất cả', 'Nhỏ', 'Vừa', 'Lớn'].map((size) => (
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
                Hiển thị {displayedProducts.length} / {filteredAndSortedProducts.length} sản phẩm
              </p>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-background border border-border rounded-lg px-4 py-2 text-foreground pr-10 cursor-pointer"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Đang tải danh sách sản phẩm...</p>
              </div>
            ) : displayedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((product, index) => (
                    <Link key={product.id} href={`/san-pham/${product.id}`} className="block animate-fade-in-up" style={{ animationDelay: `${(index % 20) * 50}ms` }}>
                      <Card className="overflow-hidden bg-card border-border h-full cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                        <div className="relative h-64 bg-white flex items-center justify-center p-4 overflow-hidden">
                          {product.thumbnailUrl ? (
                            <img src={getFullImagePath(product.thumbnailUrl)} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🔒</div>
                          )}
                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className="absolute top-4 left-4 p-2 bg-background/80 hover:bg-background rounded-lg transition backdrop-blur-sm z-10"
                          >
                            <Heart
                              className={`w-5 h-5 transition ${wishlist.includes(product.id)
                                ? 'fill-red-500 text-red-500'
                                : 'text-muted-foreground hover:text-red-500'
                                }`}
                            />
                          </button>
                        </div>

                        <div className="p-4 space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">{product.categoryName || 'Sản phẩm'}</p>
                            <h3 className="font-semibold text-lg text-foreground line-clamp-2" title={product.name}>
                              {product.name}
                            </h3>
                          </div>

                          {/* Placeholder for rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5 text-accent">
                              ★★★★★
                            </div>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">
                              {product.salePrice ? product.salePrice.toLocaleString('vi-VN') + 'đ' : (product.basePrice ? product.basePrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ')}
                            </span>
                            {product.salePrice && product.basePrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.basePrice.toLocaleString('vi-VN')}đ
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => addToCart(e, product)}
                            className="w-full bg-primary hover:bg-primary/90  cursor-pointer text-primary-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 group-hover:bg-[#c1c1c1]"
                          >
                            <ShoppingCart className="w-4 h-4 group-hover:-rotate-12 transition-transform duration-300" />
                            Thêm vào giỏ
                          </button>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <Button
                      onClick={() => setVisibleCount(prev => prev + 20)}
                      type="primary"
                      className="px-12 py-6 text-lg rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg shadow-primary/10 font-bold"
                    >
                      Xem thêm sản phẩm
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Không tìm thấy sản phẩm nào phù hợp với tiêu chí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
