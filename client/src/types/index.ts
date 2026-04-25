/**
 * Khai báo type dùng chung (API, domain, form, …).
 */

export interface ApiResponse<T> {
  status: boolean
  message?: string
  data: T
}

export interface PagedList<T> {
  items: T[]
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
}
