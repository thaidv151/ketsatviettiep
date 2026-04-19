'use client'

import { useState } from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons'
import Link from 'next/link'

type WishlistItem = {
  id: string
  name: string
  price: number
  originalPrice: number | null
  image: string | null
  category: string | null
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [mounted, setMounted] = useState(false)

  import('react').then(React => {
    React.useEffect(() => {
      setMounted(true)
      const saved = localStorage.getItem('ketsat_wishlist')
      if (saved) {
        try {
          setWishlistItems(JSON.parse(saved))
        } catch (e) {
          console.error('Invalid wishlist JSON in localStorage')
        }
      }
    }, [])
  })

  const removeFromWishlist = (id: string) => {
    const updated = wishlistItems.filter(item => item.id !== id)
    setWishlistItems(updated)
    localStorage.setItem('ketsat_wishlist', JSON.stringify(updated))
  }

  const addToCart = (id: string) => {
    // In a real app, this would add to cart
    console.log(`Added item ${id} to cart`)
  }

  return (
    <main>
      <Header />

      <div className="bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-foreground">Sản Phẩm Yêu Thích</h1>
          <p className="text-muted-foreground mt-2">Đã lưu {wishlistItems.length} sản phẩm</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!mounted ? (
          <div className="text-center py-20 text-muted-foreground">Đang tải...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Danh sách yêu thích trống</h2>
            <p className="text-muted-foreground mb-8">Hãy thêm các két sắt bạn yêu thích để lưu lại cho lần sau.</p>
            <Link href="/san-pham">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                Xem Sản Phẩm
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
                  <div className="h-32 w-32 bg-white rounded-lg flex items-center justify-center flex-shrink-0 p-2">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-6xl">🔒</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow space-y-2">
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <Link href={`/products/${item.id}`}>
                      <h3 className="text-xl font-semibold text-foreground hover:text-accent transition cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Rating placeholder */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 text-accent">
                        ★★★★★
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {item.price.toLocaleString('vi-VN')}đ
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {item.originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-auto flex flex-col gap-3 md:flex-col">
                    <button
                      onClick={() => addToCart(item.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCartOutlined className="text-base" />
                      Thêm vào giỏ
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full bg-background border border-border hover:border-destructive hover:text-destructive text-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <DeleteOutlined className="text-base" />
                      Xóa
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Summary and Actions */}
            <div className="mt-12 border-t border-border pt-8">
              <div className="max-w-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Tổng giá trị yêu thích
                </h3>
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Nếu mua tất cả sản phẩm:</p>
                  <p className="text-3xl font-bold text-foreground">
                    {wishlistItems.reduce((sum, item) => sum + item.price, 0).toLocaleString('vi-VN')}đ
                  </p>
                </div>
                <Link href="/san-pham">
                  <Button variant="outline" className="border-border hover:bg-muted w-full">
                    Tiếp tục mua sắm
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
