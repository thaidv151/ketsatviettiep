import HeroSection from '@/components/hero-section'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrustBadges from '@/components/trust-badges'
import ReviewsSection from '@/components/reviews-section'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <TrustBadges />
      <ReviewsSection />
    </main>
  )
}
