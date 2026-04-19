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

export const categoryApi = {
  async list(): Promise<CategoryDto[]> {
    const response = await axiosBase.get<CategoryDto[]>('/api/admin/categories')
    return response.data
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
