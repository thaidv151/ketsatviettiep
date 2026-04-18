import { http } from './http'

// ── DTOs ──────────────────────────────────────────────────────────────────────

export type OrderItemDto = {
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

export type PaymentDto = {
  id: string
  method: number
  methodLabel: string
  amount: number
  status: number
  statusLabel: string
  transactionId: string | null
  paidAt: string | null
}

export type OrderStatusHistoryDto = {
  id: string
  fromStatus: number
  toStatus: number
  toStatusLabel: string
  note: string | null
  changedById: string | null
  createdAt: string
}

export type OrderListDto = {
  id: string
  orderCode: string
  recipientName: string
  recipientPhone: string
  totalAmount: number
  status: number
  statusLabel: string
  paymentStatus: number
  paymentStatusLabel: string
  paymentMethod: number
  paymentMethodLabel: string
  itemCount: number
  createdAt: string
}

export type OrderDetailDto = {
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
  internalNote: string | null
  cancelReason: string | null
  createdAt: string
  items: OrderItemDto[]
  payments: PaymentDto[]
  statusHistories: OrderStatusHistoryDto[]
}

export type UpdateOrderStatusRequest = {
  newStatus: number
  note?: string | null
  changedById?: string | null
}

export type UpdateOrderNoteRequest = {
  internalNote?: string | null
  trackingNumber?: string | null
  shippingProvider?: string | null
}

// ── API ───────────────────────────────────────────────────────────────────────

export const orderApi = {
  list: () => http.get<OrderListDto[]>('/api/admin/orders'),
  getDetail: (id: string) => http.get<OrderDetailDto>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, body: UpdateOrderStatusRequest) =>
    http.post<OrderDetailDto>(`/api/admin/orders/${id}/status`, body),
  updateNote: (id: string, body: UpdateOrderNoteRequest) =>
    http.post<OrderDetailDto>(`/api/admin/orders/${id}/note`, body),
  remove: (id: string) => http.post<void>(`/api/admin/orders/${id}/delete`),
}
