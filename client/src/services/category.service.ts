import axiosBase from './axios/AxiosBase'

export type CategoryDto = {
  id: string
  parentId: string | null
  parentName: string | null
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  childCount: number
  createdAt: string
}

export type CreateCategoryRequest = {
  parentId?: string | null
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  isActive?: boolean
}

export type UpdateCategoryRequest = CreateCategoryRequest

/** Trùng với `Services.Common.PagedList<T>` từ API (camelCase) */
export type PagedList<T> = {
  items: T[]
  pageIndex: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type CategoryListParams = {
  pageIndex?: number
  pageSize?: number
  query?: string
  parentId?: string
  isActive?: boolean
  rootOnly?: boolean
}

export const categoryApi = {
  /** Danh sách có lọc + phân trang (GET `/api/admin/categories`) */
  async pagedList(params: CategoryListParams = {}): Promise<PagedList<CategoryDto>> {
    const res = await axiosBase.get<PagedList<CategoryDto>>('/api/admin/categories', { params })
    return res.data
  },

  /**
   * Portal: mảng phẳng, AllowAnonymous — phù hợp storefront.
   * Trong admin nên dùng `listForAdminForm` (JWT + GET admin, cùng DTO).
   */
  async listForSelect(): Promise<CategoryDto[]> {
    const res = await axiosBase.get<CategoryDto[]>('/api/portal/categories')
    return res.data
  },

  /** Một lần gọi GET `/api/admin/categories` (paged) đủ bản ghi cho select trong form quản trị. */
  async listForAdminForm(maxItems = 2000): Promise<CategoryDto[]> {
    const res = await this.pagedList({ pageIndex: 1, pageSize: maxItems })
    return Array.isArray(res.items) ? res.items : []
  },
  async getById(id: string): Promise<CategoryDto> {
    const response = await axiosBase.get<CategoryDto>(`/api/admin/categories/${id}`)
    return response.data
  },
  async create(body: CreateCategoryRequest): Promise<CategoryDto> {
    const response = await axiosBase.post<CategoryDto>('/api/admin/categories', body)
    return response.data
  },
  async update(id: string, body: UpdateCategoryRequest): Promise<CategoryDto> {
    const response = await axiosBase.post<CategoryDto>(`/api/admin/categories/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/admin/categories/${id}/delete`)
    return response.data
  },
}
