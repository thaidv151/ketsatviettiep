import type { Metadata } from 'next'
import HeroSection from '@/components/hero-section'
import FeaturedProducts from '@/components/featured-products'
import CategoriesSection from '@/components/categories-section'
import TrustBadges from '@/components/trust-badges'
import ReviewsSection from '@/components/reviews-section'

const siteName = 'Két sắt việt tiệp'
const homeTitle = 'Két sắt gia dụng & công nghiệp chính hãng | Mua két công ty, két tài sản an toàn'
const h1Text = 'Két sắt gia dụng và công nghiệp chính hãng — Cửa hàng trực tuyến Két sắt việt tiệp'
const homeDescription =
  'Cửa hàng két sắt trực tuyến: sản phẩm nổi bật, ưu đãi giảm giá, gợi ý theo mục lục. Tìm két tài sản, két công sở với tư vấn và bảo hành minh bạch.'

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  openGraph: {
    type: 'website',
    siteName,
    title: homeTitle,
    description: homeDescription,
    locale: 'vi_VN',
  },
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <main>
      <h1 className="sr-only">{h1Text}</h1>
      <HeroSection />
      <FeaturedProducts />
      {/* <TrustBadges />
      <ReviewsSection /> */}
    </main>
  )
}
