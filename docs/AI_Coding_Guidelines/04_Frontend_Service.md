# Chuẩn viết Client API Service (Frontend)

File service ở frontend đóng vai trò định nghĩa type cho DTOs và gọi API bằng axios.
- **Vị trí:** `client/src/services/[entity].service.ts`

## Các quy tắc quan trọng:

1. **Mapping Type chính xác:** Mọi DTO, Request từ Backend (C# PascalCase) khi serialize sang JSON sẽ thành camelCase ở Frontend. Cần định nghĩa `type` bằng TypeScript một cách chính xác.
2. **Sử dụng axiosBase:** Dự án đã có sẵn file axios cấu hình (`axiosBase`), bắt buộc import file này để gọi API, không dùng `fetch` hay `axios` thường.
3. **Export Object Api:** Gói gọn các phương thức vào một const object (ví dụ: `productApi`).

## Ví dụ mẫu (`product.service.ts`):

```typescript
import axiosBase from './axios/AxiosBase'

// ── DTOs (Response Types) ──────────────────────────────────────────

export type ProductListDto = {
  id: string
  name: string
  slug: string
  status: number
  createdAt: string
  // ... các field khác
}

export type ProductDetailDto = {
  id: string
  name: string
  // ...
}

// ── Requests (Body Types) ──────────────────────────────────────────

export type CreateProductRequest = {
  categoryId: string
  name: string
  slug: string
  // ...
}

export type UpdateProductRequest = Omit<CreateProductRequest, 'someFields'>

// ── API Object ─────────────────────────────────────────────────────

export const productApi = {
  async list(): Promise<ProductListDto[]> {
    const response = await axiosBase.get<ProductListDto[]>('/api/admin/products')
    return response.data
  },
  async getDetail(id: string): Promise<ProductDetailDto> {
    const response = await axiosBase.get<ProductDetailDto>(`/api/admin/products/${id}`)
    return response.data
  },
  async create(body: CreateProductRequest): Promise<ProductDetailDto> {
    const response = await axiosBase.post<ProductDetailDto>('/api/admin/products', body)
    return response.data
  },
  // Nhắc lại: Ở BE Cập nhật và Xóa dùng phương thức POST + hậu tố action
  async update(id: string, body: UpdateProductRequest): Promise<ProductDetailDto> {
    const response = await axiosBase.post<ProductDetailDto>(`/api/admin/products/${id}/update`, body)
    return response.data
  },
  async remove(id: string): Promise<void> {
    const response = await axiosBase.post<void>(`/api/admin/products/${id}/delete`)
    return response.data
  },
}
```
