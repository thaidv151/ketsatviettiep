# Client (Next.js) — Cấu trúc trang, service, types (VOS)

Quy ước thống nhất với màn **Forum_Topic** (`Client/src/app/(protected-pages)/Forum_Topic/`) để các tính năng sau làm giống nhau, dễ bảo trì.

---

## Cấu trúc thư mục một màn quản trị (protected)

```
Forum_Topic/
  page.tsx                 # Route page: state, gọi service, modal, layout
  components/
    ForumTopicTable.tsx    # Bảng + phân trang
    ForumTopicForm.tsx     # Form tạo/sửa
    ForumTopicDetail.tsx   # Chi tiết (modal/drawer)
    ActionDropdown.tsx     # (tuỳ màn) menu hành động
    index.ts               # export barrel
```

### Quy ước `page.tsx`

- `'use client'` khi cần hook (`useState`, `useRouter`, `useSearchParams`, …).
- **Suspense** bọc nội dung dùng `useSearchParams` (Next.js): `export default` export page bọc `<Suspense fallback={…}><PageInner /></Suspense>`.
- State tách gọn:
  - Dữ liệu danh sách (kết quả phân trang),
  - `searchParams` (payload gửi API — đồng bộ `pageIndex`, `pageSize`, sort, filter),
  - `searchForm` (giá trị ô nhập trước khi bấm “Tìm kiếm”),
  - cờ modal: tạo / sửa / xoá / chi tiết.
- **Đồng bộ URL (tuỳ nghiệp vụ)**: ví dụ `?categoryId=` — khi đổi query, reset `pageIndex` về 1.

### UI / style (Forum_Topic)

- Nền layout: `bg-slate-50/50 min-h-screen`, padding âm (`-m-4 p-4 lg:-m-8 lg:p-8`) để full width trong vùng content.
- **Breadcrumb**: icon `lucide-react` (Home, ChevronRight), text xanh `#007f32` / `#006b2c`.
- **Header khối**: `bg-white`, `rounded-sm`, `border border-slate-200`, `shadow-sm`; icon khối `bg-green-50 text-[#007f32]`.
- **Nút chính**: `bg-[#007f32] hover:bg-[#006b2c]`, có thể kèm `shadow-[0_4px_20px_rgba(0,127,50,0.25)]`.
- **Khối tìm kiếm thu gọn**: card có header click để expand/collapse (`max-h-0` / `max-h-[2000px]`), icon `Search`, `ChevronDown`.
- Form lọc: grid responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 …`; label `text-[11px] font-bold uppercase tracking-widest`.
- Bảng dữ liệu: bọc trong `Card` từ `@/components/ui`.

### Component con

- Tách **Table** (cột, loading, đổi trang, page size), **Form** (props `isOpen`, `onClose`, `onSubmit`, `initialData`, `isEdit`), **Detail** chỉ hiển thị.
- Toast: `showToast` từ `@/components/ui/toast/toastUtils`; lỗi: `extractErrorMessage` từ `@/utils/errorUtils`.

---

## Gọi API — lớp Service

- Dùng **`ApiService`** (`Client/src/services/ApiService.ts`): `get` / `post` / `put` / `delete` — đều qua Axios đã cấu hình (`withCredentials: true`).
- **Lưu ý**: `put` và `delete` trong project hiện gửi request HTTP thực tế là **POST** (xem implementation) — khi thêm endpoint backend cần khớp route/method thực tế client đang gọi.
- Mỗi domain nên có một file, ví dụ `services/Forum/forumTopicService.ts`:
  - Export **default** object chứa các hàm: `getData`, `getById`, `create`, `update`, `delete`, …
  - URL khớp controller ASP.NET: `/ForumTopic/GetData`, `/ForumTopic/Create`, `/ForumTopic/{id}`, …

### `getData` (danh sách có lọc)

- Gọi `ApiService.post` với `data` khớp body `*Search` phía C#: `pageIndex`, `pageSize`, `sortColumn`, `sortOrder`, và các field lọc (chuỗi rỗng / `null` cho “tất cả”).
- Phản hồi: `ApiResponse<T>` — kiểm `response.success` và `response.data`.

### Normalize dữ liệu (khuyến nghị)

- Backend có thể trả **PascalCase**; có thể thêm hàm `normalize…` map `Items` → `items`, `TotalCount` → `totalCount`, và các field join tùy chọn (`categoryName` / `CategoryName`) để component dùng một kiểu ổn định.

---

## Types (`@types`)

Đặt theo domain, ví dụ `Client/src/@types/Forum/forumTopic.ts`.

### Cần khai báo gì

| Loại | Mục đích |
|------|-----------|
| `{Entity}Dto` | Một bản ghi từ API (khớp field backend; ưu tiên **camelCase** trong TS vì client JSON thường camelCase). |
| `{Entity}SearchParams` | Payload cho `getData`: filter + `pageIndex`, `pageSize`, `sortColumn`, `sortOrder`. |
| `{Entity}PagedResult` (hoặc tái dùng generic) | `items`, `totalCount`, `pageIndex`, `pageSize`, `totalPage`. |
| `{Entity}CreateRequest` / `{Entity}EditRequest` | Body Create/Update (khớp ViewModel C#). |
| `type` union | Trạng thái rút gọn (ví dụ `'pending' \| 'approved' \| 'rejected'`) khi API dùng chuỗi cố định. |
| Request bổ sung | Ví dụ set trạng thái riêng: `ForumTopicSetApprovalRequest`, … |

### Quy ước

- Comment ngắn khi field chỉ có ở một số API (portal vs admin): ví dụ `authorDisplayName`, `commentCount`.
- Import trong page/component: `import type { … } from '@/@types/Forum/forumTopic'`.
- Giữ **đồng bộ** với DTO/ViewModel bên `Hinet.Service` khi đổi API.

---

## `ApiResponse` (client)

- Định nghĩa trong `@/@types/general`: `success`, `statusCode`, `data`, `error?.message`.
- Service method trả về `Promise<ApiResponse<…>>`; page xử lý success/error + toast.

---

## Checklist màn mới (giống Forum_Topic)

1. Thư mục route dưới `src/app/(protected-pages)/{TenMan}/` với `page.tsx` + `components/`.
2. File types trong `src/@types/{Domain}/…`.
3. File `services/.../{entity}Service.ts` dùng `ApiService`, URL khớp `api/[controller]`.
4. Tái dùng `Card`, `Button`, `Input`, `Dialog`, `ConfirmDialog` từ `@/components/ui` và pattern breadcrumb / màu chủ đạo xanh lá đã dùng ở Forum_Topic.

---

## File tham chiếu nhanh

- Page: `Client/src/app/(protected-pages)/Forum_Topic/page.tsx`
- Service: `Client/src/services/Forum/forumTopicService.ts`
- Types: `Client/src/@types/Forum/forumTopic.ts`
- HTTP wrapper: `Client/src/services/ApiService.ts`
- Chung: `Client/src/@types/general.ts` (`ApiResponse`, `SearchBase`)

---



