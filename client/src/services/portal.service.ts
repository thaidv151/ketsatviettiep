import axiosBase from './axios/AxiosBase'

export type PortalProductDto = {
  id: string
  name: string
  salePrice: number | null
  basePrice: number | null
  categoryName: string | null
  thumbnailUrl: string | null
}

export type PortalOrderDto = {
  id: string
  orderCode: string
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
}
