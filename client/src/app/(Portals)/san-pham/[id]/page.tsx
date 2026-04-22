'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Check, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { portalApi } from '@/services/portal.service'
import type { ProductDetailDto } from '@/services/product.service'
import { getFullImagePath } from '@/lib/path-utils'
import { useToast } from '@/hooks/use-toast'

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string
  
  const [product, setProduct] = useState<ProductDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    if (id) {
      setLoading(true)
      portalApi.getProductDetail(id)
        .then(res => {
          setProduct(res)
        })
        .catch(err => {
          console.error('Failed to fetch product detail:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [id])

  const addToCart = () => {
    if (!product) return

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.basePrice ?? 0,
      image: product.thumbnailUrl,
      quantity: quantity
    }

    const saved = localStorage.getItem('ketsat_cart')
    let cart = []
    if (saved) {
      try {
        cart = JSON.parse(saved)
      } catch (e) {
        cart = []
      }
    }

    const index = cart.findIndex((item: any) => item.id === product.id)
    if (index > -1) {
      cart[index].quantity += quantity
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

  if (loading) {
    return (
      <>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Đang tải thông tin sản phẩm...</p>
          </div>
        </main>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
              <p className="text-muted-foreground mb-8">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị ngừng kinh doanh.</p>
              <Link href="/san-pham">
                <Button>Quay lại danh sách</Button>
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham" className="hover:text-foreground transition">Sản phẩm</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-card rounded-lg p-12 min-h-[450px] border border-border overflow-hidden">
              {product.thumbnailUrl ? (
                <img 
                  src={getFullImagePath(product.thumbnailUrl)} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="text-9xl">🔒</div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className="fill-current"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">(248 đánh giá)</span>
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
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {(product.salePrice ?? product.basePrice ?? 0).toLocaleString('vi-VN')}₫
                  </span>
                  {product.salePrice && product.basePrice && product.salePrice < product.basePrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        {product.basePrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">
                        Giảm {(product.basePrice - product.salePrice).toLocaleString('vi-VN')}₫
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                {product.shortDescription || product.description?.substring(0, 200) + '...'}
              </p>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-muted/50 rounded-xl border border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Danh mục</p>
                  <p className="font-semibold">{product.categoryName || 'Chưa phân loại'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Thương hiệu</p>
                  <p className="font-semibold">{product.brandName || 'Việt Tiệp'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mã sản phẩm</p>
                  <p className="font-semibold">{product.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tình trạng</p>
                  <p className="font-semibold text-green-600">{product.statusLabel}</p>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-muted transition border-r border-border font-bold"
                  >
                    -
                  </button>
                  <span className="px-8 py-2 font-semibold min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-muted transition border-l border-border font-bold"
                  >
                    +
                  </button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg shadow-lg shadow-primary/20"
                  onClick={addToCart}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Thêm vào giỏ hàng
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-4 border-t pt-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">Giao hàng miễn phí cho đơn hàng trên 2.000.000₫</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">Cam kết hàng chính hãng 100%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check size={18} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium">Bảo hành dài hạn theo tiêu chuẩn nhà sản xuất</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8">
            <div className="flex gap-8">
              {[
                { id: 'description', label: 'Mô tả chi tiết' },
                { id: 'specs', label: 'Thông số kỹ thuật' },
                { id: 'reviews', label: 'Đánh giá' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 font-bold text-sm uppercase tracking-wider transition relative ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {activeTab === 'description' && (
                <div className="prose prose-slate max-w-none">
                  <h2 className="text-2xl font-bold mb-6">Thông tin sản phẩm</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description || 'Đang cập nhật mô tả...'}
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold mb-6">Thông số kỹ thuật</h2>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="divide-y divide-border">
                      {product.specifications ? (
                        <div className="p-6 whitespace-pre-wrap text-muted-foreground leading-relaxed">
                          {product.specifications}
                        </div>
                      ) : (
                        <div className="p-6 text-muted-foreground italic">Đang cập nhật thông số kỹ thuật...</div>
                      )}
                      
                      {/* Attributes list if available */}
                      {product.attributes?.map(attr => (
                        <div key={attr.id} className="grid grid-cols-3 p-4 hover:bg-muted/50 transition">
                          <span className="font-bold text-slate-700">{attr.name}</span>
                          <span className="col-span-2 text-muted-foreground">
                            {attr.values.map(v => v.value).join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-8 p-8 bg-muted/50 rounded-2xl border border-border">
                    <div className="text-center">
                      <div className="text-5xl font-black text-primary mb-2">4.9</div>
                      <div className="flex items-center gap-1 text-yellow-500 justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} className="fill-current" />
                        ))}
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">248 Đánh giá</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map(star => (
                        <div key={star} className="flex items-center gap-4">
                          <span className="text-sm font-bold w-4">{star}</span>
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500" 
                              style={{ width: star >= 4 ? '85%' : star === 3 ? '10%' : '2%' }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{star >= 4 ? '85%' : star === 3 ? '10%' : '2%'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { author: 'Nguyễn Văn An', date: '20/04/2024', content: 'Sản phẩm rất chắc chắn, khóa vân tay nhạy. Rất hài lòng với dịch vụ lắp đặt.' },
                      { author: 'Trần Thị Bình', date: '15/04/2024', content: 'Két sắt đẹp, sang trọng. Nhân viên tư vấn nhiệt tình.' }
                    ].map((rev, idx) => (
                      <Card key={idx} className="p-6 border-border bg-card hover:border-primary/20 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-bold text-slate-800">{rev.author}</p>
                            <p className="text-xs text-muted-foreground">{rev.date}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className="fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{rev.content}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="h-fit sticky top-24 space-y-6">
              <Card className="p-6 bg-primary/5 border-primary/20 rounded-2xl overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                <h3 className="font-bold mb-4 text-primary relative z-10">Cam kết chất lượng</h3>
                <ul className="space-y-3 text-sm text-muted-foreground relative z-10">
                  <li className="flex items-center gap-3">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>Hàng chính hãng Việt Tiệp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>Bảo hành tận nơi 24/7</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>Đổi trả trong 7 ngày</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>Bảo mật thông tin khách hàng</span>
                  </li>
                </ul>
              </Card>
              
              <Card className="p-6 border-dashed border-2 border-border rounded-2xl">
                <h3 className="font-bold mb-2">Hỗ trợ trực tuyến</h3>
                <p className="text-sm text-muted-foreground mb-4">Bạn cần tư vấn thêm về sản phẩm này?</p>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-bold">
                  Chat với chuyên viên
                </Button>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}
