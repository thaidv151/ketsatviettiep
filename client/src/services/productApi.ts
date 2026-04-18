import { http } from './http'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type ProductListDto = {
  id: string
  name: string
  slug: string
  categoryName: string | null
  brandName: string | null
  thumbnailUrl: string | null
  basePrice: number | null
  salePrice: number | null
  totalStock: number
  status: number
  statusLabel: string
  isFeatured: boolean
  createdAt: string
}

export type ProductAttributeValueDto = {
  id: string
  value: string
  colorHex: string | null
  sortOrder: number
}

export type ProductAttributeDto = {
  id: string
  name: string
  isVariantOption: boolean
  sortOrder: number
  values: ProductAttributeValueDto[]
}

export type ProductVariantDto = {
  id: string
  sku: string
  name: string | null
  price: number
  originalPrice: number | null
  stockQuantity: number
  lowStockThreshold: number
  weightGram: number | null
  imageUrl: string | null
  isActive: boolean
  attributeValueIds: string[]
}

export type ProductImageDto = {
  id: string
  imageUrl: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export type ProductDetailDto = {
  id: string
  categoryId: string
  categoryName: string | null
  brandId: string | null
  brandName: string | null
  name: string
  slug: string
  sku: string | null
  shortDescription: string | null
  description: string | null
  basePrice: number | null
  salePrice: number | null
  thumbnailUrl: string | null
  status: number
  statusLabel: string
  isFeatured: boolean
  viewCount: number
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  specifications: string | null
  createdAt: string
  images: ProductImageDto[]
  attributes: ProductAttributeDto[]
  variants: ProductVariantDto[]
}

// ── Requests ──────────────────────────────────────────────────────────────────

export type CreateProductVariantRequest = {
  sku: string
  name?: string | null
  price: number
  originalPrice?: number | null
  stockQuantity: number
  lowStockThreshold?: number
  weightGram?: number | null
  imageUrl?: string | null
  isActive?: boolean
  attributeValueIds?: string[]
}

export type CreateProductAttributeValueRequest = {
  value: string
  colorHex?: string | null
  sortOrder?: number
}

export type CreateProductAttributeRequest = {
  name: string
  isVariantOption?: boolean
  sortOrder?: number
  values: CreateProductAttributeValueRequest[]
}

export type CreateProductRequest = {
  categoryId: string
  brandId?: string | null
  name: string
  slug: string
  sku?: string | null
  shortDescription?: string | null
  description?: string | null
  basePrice?: number | null
  salePrice?: number | null
  thumbnailUrl?: string | null
  status?: number
  isFeatured?: boolean
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string | null
  specifications?: string | null
  attributes?: CreateProductAttributeRequest[]
  variants?: CreateProductVariantRequest[]
  imageUrls?: string[]
}

export type UpdateProductRequest = Omit<CreateProductRequest, 'attributes' | 'variants' | 'imageUrls'>

// ── API ───────────────────────────────────────────────────────────────────────

export const productApi = {
  list: () => http.get<ProductListDto[]>('/api/admin/products'),
  getDetail: (id: string) => http.get<ProductDetailDto>(`/api/admin/products/${id}`),
  create: (body: CreateProductRequest) => http.post<ProductDetailDto>('/api/admin/products', body),
  update: (id: string, body: UpdateProductRequest) =>
    http.post<ProductDetailDto>(`/api/admin/products/${id}/update`, body),
  remove: (id: string) => http.post<void>(`/api/admin/products/${id}/delete`),
}
