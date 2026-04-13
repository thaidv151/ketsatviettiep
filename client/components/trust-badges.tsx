import { Card } from '@/components/ui/card'
import { CheckCircle2, Lock, Award, Truck } from 'lucide-react'

const TRUST_ITEMS = [
  {
    id: 1,
    icon: Lock,
    title: 'Security Certified',
    description: 'All safes meet international security standards and certifications',
  },
  {
    id: 2,
    icon: Award,
    title: 'Premium Quality',
    description: 'Built with superior materials and precision engineering',
  },
  {
    id: 3,
    icon: Truck,
    title: 'Free Delivery',
    description: 'Complimentary white-glove delivery to your location',
  },
  {
    id: 4,
    icon: CheckCircle2,
    title: '10-Year Warranty',
    description: 'Complete peace of mind with our comprehensive coverage',
  },
]

export default function TrustBadges() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Why Choose SafeVault
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re committed to providing the highest quality security solutions with exceptional service.
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.id}
                className="p-8 bg-gradient-to-br from-card to-background border-border hover:border-accent transition-colors"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
