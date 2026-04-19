import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 -top-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-1/4 bottom-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance leading-tight">
                Protect What <span className="text-accent">Matters Most</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg text-balance">
                Premium security safes engineered for maximum protection. Certified, durable, and designed for peace of mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/san-pham">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg h-auto rounded-lg">
                  Shop Now
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="border-border hover:bg-muted px-8 py-6 text-lg h-auto rounded-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-foreground">25K+</div>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50+</div>
                <p className="text-sm text-muted-foreground">Safe Models</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">10Y</div>
                <p className="text-sm text-muted-foreground">Warranty</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 md:h-full rounded-lg bg-gradient-to-br from-muted to-secondary overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-80 bg-primary/10 rounded-lg transform -rotate-6 flex items-end justify-center overflow-hidden">
                {/* Safe visualization */}
                <div className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div className="w-20 h-20 bg-primary/30 rounded-lg mx-auto flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-primary/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary/50 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Premium Safe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
