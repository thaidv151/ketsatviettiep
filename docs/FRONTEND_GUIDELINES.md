# Frontend Development Guidelines - Két Sắt Việt Tiệp

Tài liệu này hướng dẫn các quy chuẩn phát triển frontend, cách gọi API, sử dụng component và hệ thống thông báo để đảm bảo tính nhất quán trong toàn bộ dự án.

---

## 1. Gọi API (API Calls)

Toàn bộ các yêu cầu HTTP phải thông qua `axiosBase` và được định nghĩa trong thư mục `src/services/`.

### Quy chuẩn:
- Sử dụng `axiosBase` để tự động đính kèm Token và xử lý lỗi tập trung.
- Sử dụng `appConfig.apiPrefix` từ cấu hình hệ thống thay vì fix cứng URL.
- Khai báo kiểu dữ liệu (DTO) rõ ràng cho tham số và phản hồi.

### Ví dụ:
```typescript
import axiosBase from './axios/AxiosBase'
import type { ProductDetailDto } from './product.service'

export const portalApi = {
  async getProductDetail(id: string): Promise<ProductDetailDto> {
    const response = await axiosBase.get<ProductDetailDto>(`/api/portal/products/${id}`)
    return response.data
  }
}
```

---

## 2. Xử lý Hình ảnh (Image Handling)

Để tránh lỗi đường dẫn khi hiển thị ảnh từ server (thường là đường dẫn tương đối), **bắt buộc** sử dụng tiện ích `getFullImagePath`.

### Cách sử dụng:
```tsx
import { getFullImagePath } from '@/lib/path-utils'

// Trong component
<img src={getFullImagePath(product.thumbnailUrl)} alt={product.name} />
```

- **Logic**: Nếu đường dẫn bắt đầu bằng `http`, `data:` hoặc `blob:`, nó sẽ giữ nguyên. Ngược lại, nó sẽ tự động thêm `apiPrefix`.

---

## 3. Component Upload ảnh (`ImageUpload`)

Component `ImageUpload` được tối ưu để tích hợp mượt mà với `Form.Item` của Ant Design.

### Cách sử dụng trong Form:
```tsx
import ImageUpload from '@/components/common/ImageUpload'

<Form.Item
  name="thumbnailUrl"
  label="Ảnh đại diện"
>
  <ImageUpload 
    placeholder="Tải ảnh lên" 
    maxSize={2} // Giới hạn 2MB
  />
</Form.Item>
```

### Đặc điểm:
- Tự động gọi `uploadService` để đẩy file lên server.
- Trả về đường dẫn tương đối cho Form sau khi upload thành công.
- Tích hợp sẵn thông báo `toast` khi thành công hoặc thất bại.

---

## 4. Hệ thống Thông báo (Toast System)

Chúng tôi sử dụng hệ thống Toast dựa trên Shadcn UI thay cho `message` của Ant Design để đảm bảo tính thẩm mỹ và hiệu suất.

### Cách sử dụng:
Sử dụng hook `useToast` để gọi thông báo.

```tsx
import { useToast } from '@/hooks/use-toast'

const MyComponent = () => {
  const { toast } = useToast()

  const handleAction = () => {
    toast({
      variant: 'success', // 'default' | 'destructive' | 'success'
      title: 'Thành công',
      description: 'Hành động đã được thực hiện.',
    })
  }
}
```

### Các Variant quan trọng:
- `success`: Dùng cho các hành động thành công (thêm vào giỏ, lưu dữ liệu).
- `destructive`: Dùng cho các lỗi nghiêm trọng hoặc thông báo xóa.
- `default`: Dùng cho các thông tin chung.

**Lưu ý**: Chỉ số `z-index` của Toast đã được cấu hình là `9999` để luôn nổi lên trên cùng (trên cả Modal).
