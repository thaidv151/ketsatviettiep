import { Card } from '@/components/ui/card'

const REVIEWS = [
  {
    id: 1,
    author: 'John Mitchell',
    role: 'Home Owner',
    content: 'Excellent build quality and design. The Executive Safe Pro has exceeded all my expectations. Highly secure and professionally installed.',
    rating: 5,
    image: '👤',
  },
  {
    id: 2,
    author: 'Sarah Anderson',
    role: 'Business Owner',
    content: 'SafeVault provided the perfect solution for our office. The fireproof Elite safe arrived on time and their team installed it flawlessly.',
    rating: 5,
    image: '👩',
  },
  {
    id: 3,
    author: 'Robert Davis',
    role: 'Insurance Agent',
    content: 'I recommend SafeVault to all my clients. Their safes meet all insurance requirements and provide the highest security standards.',
    rating: 5,
    image: '👨',
  },
  {
    id: 4,
    author: 'Lisa Chen',
    role: 'Real Estate Agent',
    content: 'The quality and customer service from SafeVault are outstanding. Every detail is carefully considered for maximum security.',
    rating: 5,
    image: '👩‍🦱',
  },
]

export default function ReviewsSection() {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Read what our satisfied customers have to say about SafeVault.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review) => (
            <Card
              key={review.id}
              className="p-6 bg-background border-border space-y-4 flex flex-col h-full"
            >
              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-accent text-lg">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                "{review.content}"
              </p>

              {/* Author */}
              <div className="border-t border-border pt-4 flex items-center gap-3">
                <div className="text-2xl">{review.image}</div>
                <div>
                  <p className="font-semibold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
