import axiosBase from './axios/AxiosBase'
import type { ProductDetailDto } from './product.service'
import type { BannerDto } from './banner.service'
export type { BannerDto }

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

export type CreatePortalOrderLinePayload = {
  productId: string
  variantId: string | null
  quantity: number
  price: number
}

export type CreatePortalOrderPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  ward: string
  zipCode: string
  paymentMethod: string
  items: CreatePortalOrderLinePayload[]
}

export type CreatePortalOrderResponse = {
  orderId: string
  orderCode: string
}

export type PortalOrderItemDto = {
  id: string
  productId: string
  variantId: string | null
  productName: string
  variantName: string | null
  sku: string | null
  thumbnailUrl: string | null
  unitPrice: number
  discountAmount: number
  quantity: number
  subTotal: number
}

export type PortalOrderDetailDto = {
  id: string
  orderCode: string
  userId: string | null
  recipientName: string
  recipientPhone: string
  province: string | null
  district: string | null
  ward: string | null
  addressDetail: string
  subTotal: number
  shippingFee: number
  discountAmount: number
  totalAmount: number
  status: number
  statusLabel: string
  paymentStatus: number
  paymentStatusLabel: string
  paymentMethod: number
  paymentMethodLabel: string
  couponCode: string | null
  shippingProvider: string | null
  trackingNumber: string | null
  shippedAt: string | null
  deliveredAt: string | null
  customerNote: string | null
  cancelReason: string | null
  createdAt: string
  items: PortalOrderItemDto[]
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
  async getOrder(id: string): Promise<PortalOrderDetailDto> {
    const response = await axiosBase.get<PortalOrderDetailDto>(`/api/portal/orders/${encodeURIComponent(id)}`)
    return response.data
  },
  async createOrder(body: CreatePortalOrderPayload): Promise<CreatePortalOrderResponse> {
    const response = await axiosBase.post<CreatePortalOrderResponse>('/api/portal/orders', body)
    return response.data
  },
  async getProductDetail(id: string): Promise<ProductDetailDto> {
    const response = await axiosBase.get<ProductDetailDto>(`/api/portal/products/${id}`)
    return response.data
  },
  async getProductDetailBySlug(slug: string): Promise<ProductDetailDto> {
    const enc = encodeURIComponent(slug)
    const response = await axiosBase.get<ProductDetailDto>(`/api/portal/products/by-slug/${enc}`)
    return response.data
  },
  async getBanners(): Promise<BannerDto[]> {
    const response = await axiosBase.get<BannerDto[]>('/api/portal/banners')
    return response.data
  },
}
