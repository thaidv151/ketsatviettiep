# Tổng quan Quy trình (Overview & Workflow)

Thư mục `docs/AI_Coding_Guidelines/` chứa các hướng dẫn chi tiết dành cho AI (và lập trình viên) khi phát triển dự án này. 

## Quy trình chuẩn khi tạo 1 chức năng (Module/Entity) mới

Để đảm bảo tính đồng nhất, khi có yêu cầu thêm một tính năng mới (Ví dụ: `News`, `Promotion`, v.v.), AI cần thực hiện theo thứ tự sau:

1. **Database & Entity (Backend):**
   - Tạo class thực thể trong `server/Model/Entities/`.
   - Cập nhật `DbContext` và tạo Migration.

2. **Repository (Backend):**
   - Tạo Interface `I[Entity]Repository` và class `[Entity]Repository` trong `server/Repositories/`.

3. **Service & DTOs (Backend):**
   - Tạo các class DTOs (Data Transfer Objects) như `[Entity]ListDto`, `Create[Entity]Request` trong `server/Services/[Module]`.
   - Tạo Interface `I[Entity]Service` và thực thi `[Entity]Service`.

4. **Controller (Backend):**
   - Tạo file `Admin[Entity]sController.cs` trong `server/Api/Controllers/Admin/`.

5. **API Client Service (Frontend):**
   - Tạo file `[entity].service.ts` trong `client/src/services/`.
   - Định nghĩa chính xác các interface/type tương ứng với DTOs của Backend.

6. **View & UI Components (Frontend):**
   - Tạo thư mục chức năng tại `client/src/app/(Managers)/[entities]/`.
   - Cấu trúc các file: `page.tsx` (Danh sách), `createOrUpdate.tsx` (Form Thêm/Sửa), `detail.tsx` (Chi tiết).

---
👉 **Lưu ý:** Vui lòng đọc các file tiếp theo trong thư mục này để xem quy chuẩn code chi tiết cho từng lớp (Layer).
