# Chuẩn viết View & UI Components (Frontend)

Dự án Frontend sử dụng **Next.js App Router**, **Tailwind CSS**, và thư viện UI **Ant Design (antd)**.

- **Vị trí màn hình Quản trị (Admin):** `client/src/app/(Managers)/[module]/`

## 1. Cấu trúc thư mục của một màn hình
Khi tạo một trang quản lý mới (ví dụ: Quản lý Sản phẩm - `products`), tạo thư mục `products` và cấu trúc như sau:
```
client/src/app/(Managers)/products/
 ├── page.tsx               # Màn hình danh sách chính (Table hiển thị dữ liệu)
 ├── createOrUpdate.tsx     # Form thêm mới / cập nhật (thường dùng chung hoặc tách riêng tùy độ phức tạp)
 ├── detail.tsx             # Component hiển thị chi tiết (nếu có)
 ├── search.tsx             # Component bộ lọc tìm kiếm (Form search phía trên Table)
```

## 2. Quy chuẩn chung khi viết View

1. **Client Component vs Server Component:** 
   Đa số các trang Admin sử dụng hooks của React (`useState`, `useEffect`) hoặc thao tác với Antd nên cần bắt đầu bằng `"use client"`.
2. **Sử dụng Ant Design:** 
   - Danh sách sử dụng `<Table />` của antd.
   - Form thêm/sửa sử dụng `<Form />`, `<Input />`, `<Select />` của antd để tận dụng tính năng validate.
   - Hiển thị thông báo (toast) dùng `message` từ antd.
3. **Kết nối API (Data Fetching):**
   - Import file service đã tạo ở phần trước (ví dụ: `productApi.list()`).
   - Gọi API trong `useEffect` hoặc qua các custom hooks (như SWR / React Query nếu có cài đặt).
4. **Chia nhỏ Component:**
   Nếu trang `page.tsx` quá dài (hiển thị bảng, xử lý modal thêm sửa), hãy tách Modal thêm/sửa ra các component riêng như `createOrUpdate.tsx`.

## Ví dụ cấu trúc file `page.tsx`:
```tsx
"use client"
import React, { useEffect, useState } from 'react'
import { Table, Button, Space, message, Popconfirm } from 'antd'
import { productApi, ProductListDto } from '@/services/product.service'

export default function ProductsPage() {
  const [data, setData] = useState<ProductListDto[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await productApi.list()
      setData(result)
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await productApi.remove(id)
      message.success("Xóa thành công")
      loadData()
    } catch (error) {
      message.error("Xóa thất bại")
    }
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Trạng thái', dataIndex: 'statusLabel', key: 'status' },
    { 
      title: 'Hành động', 
      key: 'action',
      render: (_: any, record: ProductListDto) => (
        <Space>
          <Button type="primary">Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.id)}>
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Quản lý Sản phẩm</h1>
        <Button type="primary">Thêm mới</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        loading={loading} 
      />
    </div>
  )
}
```
## 3. Thành phần dùng chung (Common Components)

### ImageUpload
Dùng để tải ảnh lên server và nhận về đường dẫn. Component này được thiết kế để hoạt động hoàn hảo bên trong `Form.Item` của Ant Design.

**Cách sử dụng:**
```tsx
import ImageUpload from '@/components/common/ImageUpload'

// Trong Form
<Form.Item
  label="Ảnh đại diện"
  name="imageUrl"
  rules={[{ required: true, message: 'Vui lòng tải ảnh lên' }]}
>
  <ImageUpload placeholder="Chọn ảnh đại diện" />
</Form.Item>
```
*Lưu ý: Component sẽ tự động gọi API upload và điền URL trả về vào field `imageUrl` của Form.*
