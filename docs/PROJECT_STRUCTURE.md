# Cấu trúc dự án & Tiêu chuẩn Code (Project Structure & Coding Guidelines)

Tài liệu này định nghĩa cấu trúc của dự án bao gồm `client` (Next.js) và `server` (.NET Web API). AI và các lập trình viên nên tuân thủ cấu trúc này khi thêm các tính năng mới để đảm bảo tính đồng nhất.

## 1. Client (Frontend - Next.js)

Thư mục gốc: `client/src/`

Cấu trúc thư mục:
- `app/`: Chứa các trang (pages) và layouts theo Next.js App Router. (Ví dụ: `app/(Managers)` cho trang quản trị, `app/(Store)` cho trang khách hàng).
- `components/`: Chứa các React components có thể tái sử dụng. Các components nên được module hóa.
- `configs/`: Các cấu hình dự án (ví dụ cấu hình antd, biến môi trường, theme).
- `constant/`: Khai báo các hằng số, biến dùng chung cho toàn dự án.
- `hooks/`: Chứa các custom React hooks.
- `lib/`: Các tiện ích cấu hình thư viện bên thứ 3 (như axios client, dayjs, v.v.).
- `services/`: Nơi định nghĩa các hàm gọi API tương tác với Backend. Mỗi module/feature nên có một file service riêng.
- `stores/`: Quản lý state toàn cục (Global State Management).
- `types/`: Định nghĩa các kiểu dữ liệu (TypeScript Interfaces, Types). Đảm bảo type-safe khi mapping với DTO từ backend.
- `utils/`: Các hàm hỗ trợ (helper functions) độc lập.

**Quy tắc khi tạo tính năng mới trên Client:**
1. **Routing:** Tạo thư mục trong `app/` và định nghĩa `page.tsx`.
2. **Components:** Tạo component mới tại `components/` hoặc thư mục con trong `app/[route]/components` nếu component chỉ dùng riêng cho trang đó.
3. **API Call:** Thêm interface/type vào `types/`, định nghĩa API path ở `constant/` (nếu có), viết hàm gọi API trong `services/`, và gọi từ client/server component.

---

## 2. Server (Backend - .NET C# Web API)

Thư mục gốc: `server/`

Dự án áp dụng kiến trúc nhiều tầng (N-Tier/Clean Architecture):
- `Api/`: Lớp Controller tiếp nhận Request/Response, cấu hình hệ thống (Program.cs), Auth, và AppSettings. Không chứa logic nghiệp vụ ở đây.
- `Model/`: 
  - `Entities/`: Định nghĩa các thực thể CSDL (Entity Framework).
  - `Dtos/`: Data Transfer Objects - Đối tượng dùng để giao tiếp với Client (Request/Response).
  - `Persistence/`: Chứa `DbContext` và cấu hình kết nối CSDL.
  - `Migrations/`: Lưu trữ các file Entity Framework Migrations.
- `Repositories/`: Lớp truy xuất dữ liệu (Data Access Layer). Giao tiếp trực tiếp với DbContext. Chứa các file Repository và Interfaces.
- `Services/`: Lớp logic nghiệp vụ (Business Logic Layer). Chứa logic xử lý, kiểm tra dữ liệu, gọi đến Repositories và chuẩn bị dữ liệu (Mapping) cho Controllers. Được chia theo các thư mục chức năng (vd: `ProductModule`, `OrderModule`, `Auth`).

**Quy tắc khi tạo tính năng mới trên Server:**
1. **Database:** Tạo/Sửa Entity trong `Model/Entities/`. Cập nhật `DbContext` tại `Model/Persistence/` và chạy Migration.
2. **Data Access:** Tạo Interface và class Repository trong `Repositories/` để tương tác với Entity. Cần đăng ký DI tại `DependencyInjection.cs`.
3. **Business Logic:** Tạo DTOs trong `Model/Dtos/`. Viết Service (kèm Interface) tại `Services/[Tên Module]/` thực hiện logic và map Entity sang DTO.
4. **API Endpoint:** Tạo API endpoint trong thư mục `Api/Controllers/`. Inject Service tương ứng và trả về kết quả qua HTTP Response.

---

## 3. Quy trình chung khi phát triển chức năng (Workflow)

Mỗi khi yêu cầu AI tạo một chức năng (ví dụ: "Quản lý mã giảm giá"):
1. AI phân tích và xây dựng **Entity/Database Migration** (Backend).
2. AI xây dựng **DTO, Repository, Service** và **API Controller** (Backend).
3. AI xây dựng **Interface, Service gọi API** (Frontend).
4. AI tạo **Page UI, Components** và kết nối API (Frontend).

## Ghi chú cho AI (AI Instructions):
- **BẮT BUỘC:** Đọc các tài liệu quy chuẩn chi tiết trong thư mục `docs/AI_Coding_Guidelines/` trước khi bắt tay vào code:
  - [01. Tổng quan & Luồng làm việc (Overview)](file:///d:/sources/ketsatviettiep/docs/AI_Coding_Guidelines/01_Overview.md)
  - [02. Chuẩn viết Controller (Backend API)](file:///d:/sources/ketsatviettiep/docs/AI_Coding_Guidelines/02_Backend_Controller.md)
  - [03. Chuẩn viết Service & Repository (Backend)](file:///d:/sources/ketsatviettiep/docs/AI_Coding_Guidelines/03_Backend_Service_Repository.md)
  - [04. Chuẩn viết API Service (Client)](file:///d:/sources/ketsatviettiep/docs/AI_Coding_Guidelines/04_Frontend_Service.md)
  - [05. Chuẩn viết View & Component (Client)](file:///d:/sources/ketsatviettiep/docs/AI_Coding_Guidelines/05_Frontend_View.md)
  - [Hướng dẫn phát triển Frontend mới nhất (API, Upload, Toast)](file:///d:/sources/ketsatviettiep/docs/FRONTEND_GUIDELINES.md)

- Đồng bộ tên biến, chuẩn định dạng C# (PascalCase) sang TypeScript (camelCase) một cách chính xác.
