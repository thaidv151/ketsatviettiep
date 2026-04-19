import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, ShoppingCart } from 'lucide-react'

type ProductListDto = {
  id: string
  name: string
  slug: string
  categoryName: string | null
  thumbnailUrl: string | null
  basePrice: number | null
  salePrice: number | null
  isFeatured: boolean
}

async function getFeaturedProducts(): Promise<ProductListDto[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/portal/products`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const products: ProductListDto[] = await res.json()
    return products.filter((p) => p.isFeatured).slice(0, 4)
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return []
  }
}

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts()

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sản Phẩm Nổi Bật
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá các dòng sản phẩm an toàn, chất lượng, được đánh giá cao nhất.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card border-border">
              {/* Image Container */}
              <div className="relative h-64 bg-white overflow-hidden flex items-center justify-center">
                {product.thumbnailUrl ? (
                  <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-6xl">🔒</div>
                )}

                {/* Badge */}
                {product.salePrice && product.basePrice && product.salePrice < product.basePrice && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Sale
                    </span>
                  </div>
                )}

                {/* Wishlist Button */}
                <button className="absolute top-4 left-4 p-2 bg-background/80 hover:bg-background rounded-lg transition backdrop-blur-sm">
                  <Heart className="w-5 h-5 text-muted-foreground hover:text-accent transition" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{product.categoryName || 'Sản phẩm'}</p>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-2" title={product.name}>
                    {product.name}
                  </h3>
                </div>

                {/* Rating (Mock) */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent">★</span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {product.salePrice
                      ? product.salePrice.toLocaleString() + 'đ'
                      : (product.basePrice ? product.basePrice.toLocaleString() + 'đ' : 'Liên hệ')}
                  </span>
                  {product.salePrice && product.basePrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.basePrice.toLocaleString()}đ
                    </span>
                  )}
                </div>

                {/* Button */}
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link href="/san-pham">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
              Xem tất cả sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
