import axiosBase from './axios/AxiosBase'
import type { ProductDetailDto } from './product.service'

export type PortalProductDto = {
  id: string
  name: string
  slug: string
  salePrice: number | null
  basePrice: number | null
  categoryName: string | null
  thumbnailUrl: string | null
  isFeatured: boolean
}

export type PortalOrderDto = {
  id: string
  orderCode: string
  userId: string | null
  createdAt: string
  status: number
  statusLabel: string
  totalAmount: number
  itemCount: number
}

export const portalApi = {
  async getProducts(): Promise<PortalProductDto[]> {
    const response = await axiosBase.get<PortalProductDto[]>('/api/portal/products')
    return response.data
  },
  async getOrders(): Promise<PortalOrderDto[]> {
    const response = await axiosBase.get<PortalOrderDto[]>('/api/portal/orders')
    return response.data
  },
  async getProductDetail(id: string): Promise<ProductDetailDto> {
    const response = await axiosBase.get<ProductDetailDto>(`/api/portal/products/${id}`)
    return response.data
  },
}
