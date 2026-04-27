import ProductDetailClient from './ProductDetailClient'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Server Component shell: trang chỉ `use client` trong [slug]/page.tsx khiến Next 16
 * trả HTML 404 mặc định; cần wrapper server để route /san-pham/[slug] khớp đúng.
 */
export default async function SanPhamChiTietPage({ params }: PageProps) {
  const { slug } = await params
  return <ProductDetailClient initialSlug={slug} />
}
