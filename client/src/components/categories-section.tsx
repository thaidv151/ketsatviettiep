import Link from 'next/link'
import { Card } from '@/components/ui/card'

type CategoryDto = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  childCount: number
}

async function getCategories(): Promise<CategoryDto[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/portal/categories`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}

export default async function CategoriesSection() {
  const categories = await getCategories()

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
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="h-full overflow-hidden bg-background border-border hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="p-6 h-full flex flex-col justify-between">
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {category.imageUrl ? (
                      <img src={category.imageUrl} alt={category.name} className="w-12 h-12 object-contain" />
                    ) : (
                      '📁'
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || 'Khám phá sản phẩm'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-accent">
                      View details
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
