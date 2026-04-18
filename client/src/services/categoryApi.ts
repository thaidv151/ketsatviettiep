import { http } from './http'

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
  list: () => http.get<CategoryDto[]>('/api/admin/categories'),
  getById: (id: string) => http.get<CategoryDto>(`/api/admin/categories/${id}`),
  create: (body: CreateCategoryRequest) => http.post<CategoryDto>('/api/admin/categories', body),
  update: (id: string, body: UpdateCategoryRequest) =>
    http.post<CategoryDto>(`/api/admin/categories/${id}/update`, body),
  remove: (id: string) => http.post<void>(`/api/admin/categories/${id}/delete`),
}
