import axiosBase from './axios/AxiosBase'

export type CouponDto = {
  id: string
  code: string
  description: string | null
  discountType: number
  discountTypeLabel: string
  discountValue: number
  minOrderAmount: number | null
  maxDiscountAmount: number | null
  usageLimit: number | null
  usedCount: number
  perUserLimit: number | null
  startAt: string | null
  expiredAt: string | null
  isActive: boolean
  createdAt: string
}

export type CreateCouponRequest = {
  code: string
  description?: string | null
  discountType: number
  discountValue: number
  minOrderAmount?: number | null
  maxDiscountAmount?: number | null
  usageLimit?: number | null
  perUserLimit?: number | null
  startAt?: string | null
  expiredAt?: string | null
  isActive?: boolean
}

export type UpdateCouponRequest = CreateCouponRequest

export const couponApi = {
  async list(): Promise<CouponDto[]> {
    const response = await axiosBase.get<CouponDto[]>('/api/admin/coupons')
    return response.data
  },
  async getById(id: string): Promise<CouponDto> {
    const response = await axiosBase.get<CouponDto>(`/api/admin/coupons/${id}`)
    return response.data
  },
  async create(body: CreateCouponRequest): Promise<CouponDto> {
    const response = await axiosBase.post<CouponDto>('/api/admin/coupons', body)
    return response.data
  },
  async update(id: string, body: UpdateCouponRequest): Promise<CouponDto> {
    const response = await axiosBase.post<CouponDto>(`/api/admin/coupons/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/admin/coupons/${id}/delete`)
    return response.data
  },
}
