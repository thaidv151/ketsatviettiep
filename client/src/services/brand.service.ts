import axiosBase from './axios/AxiosBase'

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
  async list(): Promise<BrandDto[]> {
    const response = await axiosBase.get<BrandDto[]>('/api/admin/brands')
    return response.data
  },
  async getById(id: string): Promise<BrandDto> {
    const response = await axiosBase.get<BrandDto>(`/api/admin/brands/${id}`)
    return response.data
  },
  async create(body: CreateBrandRequest): Promise<BrandDto> {
    const response = await axiosBase.post<BrandDto>('/api/admin/brands', body)
    return response.data
  },
  async update(id: string, body: UpdateBrandRequest): Promise<BrandDto> {
    const response = await axiosBase.post<BrandDto>(`/api/admin/brands/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/admin/brands/${id}/delete`)
    return response.data
  },
}
