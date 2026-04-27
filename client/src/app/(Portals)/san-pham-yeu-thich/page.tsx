'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { portalApi, type PortalProductDto } from '@/services/portal.service'
import type { CartLine } from '@/types/cart'
import { getFullImagePath } from '@/lib/path-utils'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<PortalProductDto[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    fetchWishlistData()
  }, [])

  const fetchWishlistData = async () => {
    try {
      setLoading(true)
      const savedIds = localStorage.getItem('ketsat_wishlist')
      if (!savedIds) {
        setWishlistItems([])
        return
      }

      const ids: string[] = JSON.parse(savedIds)
      if (ids.length === 0) {
        setWishlistItems([])
        return
      }

      // Fetch all products and filter (simpler than calling detail API multiple times)
      const allProducts = await portalApi.getProducts()
      const filtered = allProducts.filter(p => ids.includes(p.id))
      setWishlistItems(filtered)
    } catch (e) {
      console.error('Failed to load wishlist:', e)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = (id: string) => {
    const savedIds = localStorage.getItem('ketsat_wishlist')
    if (savedIds) {
      const ids: string[] = JSON.parse(savedIds)
      const updatedIds = ids.filter(itemId => itemId !== id)
      localStorage.setItem('ketsat_wishlist', JSON.stringify(updatedIds))
      setWishlistItems(prev => prev.filter(item => item.id !== id))

      toast({
        variant: 'default',
        title: 'Đã xóa',
        description: 'Sản phẩm đã được xóa khỏi danh sách yêu thích.',
      })
    }
  }

  const addToCart = (product: PortalProductDto) => {
    const cartItem: CartLine = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.salePrice ?? product.basePrice ?? 0,
      image: product.thumbnailUrl,
      quantity: 1,
      category: product.categoryName,
      variantId: null,
      variantLabel: null,
    }

    const saved = localStorage.getItem('ketsat_cart')
    let cart: CartLine[] = []
    if (saved) {
      try {
        cart = JSON.parse(saved) as CartLine[]
      } catch (e) {
        cart = []
      }
    }

    const lineKey = `${product.id}::`
    const index = cart.findIndex((item) => `${item.id}::${item.variantId ?? ''}` === lineKey)
    if (index > -1) {
      cart[index].quantity += 1
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem('ketsat_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart-updated'))

    toast({
      variant: 'success',
      title: 'Đã thêm vào giỏ hàng',
      description: `Sản phẩm ${product.name} đã được thêm thành công.`,
    })
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background">

      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Sản Phẩm Yêu Thích</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            {loading ? 'Đang cập nhật...' : `Bạn có ${wishlistItems.length} sản phẩm được lưu lại`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Đang tải danh sách...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border">
            <div className="text-7xl mb-8">❤️</div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Danh sách yêu thích trống</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
              Hãy khám phá bộ sưu tập két sắt của chúng tôi và lưu lại những sản phẩm bạn ưng ý nhất.
            </p>
            <Link href="/san-pham">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg h-auto rounded-2xl shadow-xl shadow-primary/20 font-bold transition-all hover:scale-105">
                Khám Phá Ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Wishlist Items List */}
            <div className="lg:col-span-2 space-y-6">
              {wishlistItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden bg-card border-border hover:shadow-2xl transition-all duration-500 group rounded-2xl border-opacity-50"
                >
                  <div className="p-6 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                    {/* Product Image */}
                    <div className="h-40 w-40 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 p-4 border border-border group-hover:scale-105 transition-transform duration-500">
                      {item.thumbnailUrl ? (
                        <img src={getFullImagePath(item.thumbnailUrl)} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-7xl">🔒</div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow space-y-3">
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.categoryName || 'Két Sắt'}
                      </div>
                      <Link href={`/san-pham/${encodeURIComponent(item.slug || item.id)}`}>
                        <h3 className="text-2xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-4 mt-4">
                        <span className="text-2xl font-black text-primary">
                          {(item.salePrice ?? item.basePrice ?? 0).toLocaleString('vi-VN')}₫
                        </span>
                        {item.salePrice && item.basePrice && item.salePrice < item.basePrice && (
                          <span className="text-sm text-muted-foreground line-through font-medium">
                            {item.basePrice.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full sm:w-auto flex flex-row sm:flex-col gap-3">
                      <Button
                        onClick={() => addToCart(item)}
                        className="flex-1 sm:w-40 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 shadow-lg shadow-primary/10"
                      >
                        <ShoppingCartOutlined className="mr-2" />
                        Giỏ hàng
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex-1 sm:w-40 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive font-bold rounded-xl h-12 transition-all"
                      >
                        <DeleteOutlined className="mr-2" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-8 bg-card border-border rounded-3xl shadow-xl border-opacity-50">
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                    Tóm tắt danh sách
                  </h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-muted-foreground font-medium">
                      <span>Số lượng:</span>
                      <span className="text-foreground">{wishlistItems.length} sản phẩm</span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">Ước tính tổng giá trị:</p>
                      <p className="text-4xl font-black text-primary tracking-tight">
                        {wishlistItems.reduce((sum, item) => sum + (item.salePrice ?? item.basePrice ?? 0), 0).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Link href="/san-pham" className="block">
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-border hover:bg-muted text-lg transition-all">
                        Tiếp tục mua sắm
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed">
                      Sản phẩm trong danh sách yêu thích có thể thay đổi giá hoặc hết hàng theo thời gian.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

    </main>
  )
}
