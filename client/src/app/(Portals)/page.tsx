import Header from '@/components/header'
import HeroSection from '@/components/hero-section'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrustBadges from '@/components/trust-badges'
import ReviewsSection from '@/components/reviews-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <TrustBadges />
      <ReviewsSection />
      <Footer />
    </main>
  )
}
