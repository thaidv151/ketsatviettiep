import axiosBase from './axios/AxiosBase'

// ── DTOs (Response Types) ──────────────────────────────────────────────────

export type BannerDto = {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  description: string | null
  sortOrder: number
  isActive: boolean
  startDate: string | null
  endDate: string | null
  createdAt: string
}

// ── Requests (Body Types) ──────────────────────────────────────────────────

export type CreateBannerRequest = {
  title: string
  imageUrl: string
  linkUrl?: string | null
  description?: string | null
  sortOrder?: number
  isActive?: boolean
  startDate?: string | null
  endDate?: string | null
}

export type UpdateBannerRequest = CreateBannerRequest

// ── API Object ─────────────────────────────────────────────────────────────

export const bannerApi = {
  async list(): Promise<BannerDto[]> {
    const response = await axiosBase.get<BannerDto[]>('/api/admin/banners')
    return response.data
  },
  async getById(id: string): Promise<BannerDto> {
    const response = await axiosBase.get<BannerDto>(`/api/admin/banners/${id}`)
    return response.data
  },
  async create(body: CreateBannerRequest): Promise<BannerDto> {
    const response = await axiosBase.post<BannerDto>('/api/admin/banners', body)
    return response.data
  },
  async update(id: string, body: UpdateBannerRequest): Promise<BannerDto> {
    const response = await axiosBase.post<BannerDto>(`/api/admin/banners/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/admin/banners/${id}/delete`)
    return response.data
  },
}
