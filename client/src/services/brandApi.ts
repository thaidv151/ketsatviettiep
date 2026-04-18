import { http } from './http'

export type BrandDto = {
  id: string
  name: string
  slug: string | null
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  isActive: boolean
  createdAt: string
}

export type CreateBrandRequest = {
  name: string
  slug?: string | null
  description?: string | null
  logoUrl?: string | null
  websiteUrl?: string | null
  isActive?: boolean
}

export type UpdateBrandRequest = CreateBrandRequest

export const brandApi = {
  list: () => http.get<BrandDto[]>('/api/admin/brands'),
  getById: (id: string) => http.get<BrandDto>(`/api/admin/brands/${id}`),
  create: (body: CreateBrandRequest) => http.post<BrandDto>('/api/admin/brands', body),
  update: (id: string, body: UpdateBrandRequest) =>
    http.post<BrandDto>(`/api/admin/brands/${id}/update`, body),
  remove: (id: string) => http.post<void>(`/api/admin/brands/${id}/delete`),
}
