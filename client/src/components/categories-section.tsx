import Link from 'next/link'
import { Card } from '@/components/ui/card'

const CATEGORIES = [
  {
    id: 1,
    name: 'Home Safes',
    description: 'Compact safes for residential use',
    icon: '🏠',
    count: 12,
  },
  {
    id: 2,
    name: 'Office Safes',
    description: 'Professional security for businesses',
    icon: '🏢',
    count: 18,
  },
  {
    id: 3,
    name: 'Fireproof Safes',
    description: 'Fire-resistant protection',
    icon: '🔥',
    count: 8,
  },
  {
    id: 4,
    name: 'Digital Safes',
    description: 'Smart locks and biometric access',
    icon: '📱',
    count: 15,
  },
]

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect safe for your specific needs and requirements.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="h-full overflow-hidden bg-background border-border hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="p-6 h-full flex flex-col justify-between">
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent">
                      {category.count} products
                    </span>
                    <span className="text-accent group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
