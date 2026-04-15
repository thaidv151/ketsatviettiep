import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, ShoppingCart } from 'lucide-react'

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Executive Safe Pro',
    price: 2499,
    originalPrice: 2999,
    category: 'Office',
    rating: 4.9,
    reviews: 248,
    image: '🔒',
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'Home Guardian 500',
    price: 1299,
    originalPrice: 1599,
    category: 'Home',
    rating: 4.8,
    reviews: 192,
    image: '🏠',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Fireproof Elite',
    price: 3499,
    originalPrice: 3999,
    category: 'Fireproof',
    rating: 4.9,
    reviews: 156,
    image: '🔥',
    badge: 'Certified',
  },
  {
    id: 4,
    name: 'Digital Smart Safe',
    price: 1899,
    originalPrice: 2199,
    category: 'Digital',
    rating: 4.7,
    reviews: 128,
    image: '📱',
    badge: null,
  },
]

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Safes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular and highly-rated security safes, trusted by thousands of customers.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-card border-border">
              {/* Image Container */}
              <div className="relative h-64 bg-muted overflow-hidden flex items-center justify-center">
                <div className="text-6xl">{product.image}</div>

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {product.badge}
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
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <h3 className="font-semibold text-lg text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent">★</span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
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
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
