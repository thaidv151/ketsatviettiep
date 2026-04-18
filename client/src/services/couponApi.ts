import { http } from './http'

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
  list: () => http.get<CouponDto[]>('/api/admin/coupons'),
  getById: (id: string) => http.get<CouponDto>(`/api/admin/coupons/${id}`),
  create: (body: CreateCouponRequest) => http.post<CouponDto>('/api/admin/coupons', body),
  update: (id: string, body: UpdateCouponRequest) =>
    http.post<CouponDto>(`/api/admin/coupons/${id}/update`, body),
  remove: (id: string) => http.post<void>(`/api/admin/coupons/${id}/delete`),
}
