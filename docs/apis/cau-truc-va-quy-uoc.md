# API — Cấu trúc và quy ước (VOS / Hinet)

Tài liệu này mô tả cách **Controller → Service → Repository** được tổ chức trong solution `Api/`, cách **truy vấn / tìm kiếm / phân trang**, và quy ước đặt tên để các lần chỉnh sửa sau giữ đồng nhất.

---

## Vị trí project

| Layer | Project | Ví dụ namespace |
|--------|---------|-----------------|
| HTTP API | `Hinet.Api` | `Hinet.Api.Controllers` |
| Nghiệp vụ | `Hinet.Service` | `Hinet.Service.{Feature}Service` |
| Truy cập dữ liệu | `Hinet.Repository` | `Hinet.Repository.{Feature}Repository` |
| Entity / DbContext | `Hinet.Model` | `Hinet.Model.Entities` |

---

## Controller

- Kế thừa `HinetController` (trong `Controllers/HinetController.cs`): `[ApiController]`, `[Authorize]`, có sẵn `UserId`, `Locale`, `DonViId`, …
- Route mặc định: `[Route("api/[controller]")]` → controller `ForumTopicController` → base path `api/ForumTopic`.
- Thường dùng:
  - `Ok(ApiResponse<T>.Ok(data))` / `BadRequest(ApiResponse<string>.Fail("…"))` / `NotFound(…)`
- Body JSON cho danh sách có lọc: **`[HttpPost("GetData")]` + `[FromBody] {Entity}Search`** (không phải GET query string) — ví dụ `ForumTopicController.GetData`.
- Tham chiếu: `Api/Hinet.Api/Controllers/ForumTopicController.cs`

---

## Service

- Interface: `I{Name}Service` kế thừa `IService<TEntity>` khi cần CRUD chuẩn từ `Service<T>`.
- Lớp: `{Name}Service : Service<TEntity>, I{Name}Service`.
- Constructor: inject `I{Name}Repository` và gọi `base(repository)`; có thể inject thêm `HinetContext` hoặc repository khác khi cần join nhiều bảng.
- **Đăng ký DI**: trong `Startup.cs` → `AddDependencyInjection`, các `I*Service` / `*Service` được quét tự động theo quy tắc: interface và class cùng kết thúc bằng `Service`, tên implementation = `I` + tên class (ví dụ `IForumTopicService` → `ForumTopicService`).

### Thư mục con trong mỗi feature (ví dụ `ForumTopicService/`)

| Mục | Gợi ý |
|-----|--------|
| `Dto/` | DTO trả về client (ví dụ `ForumTopicDto`) |
| `ViewModels/` | Model nhận từ API: `*Search` (kế thừa `SearchBase`), `*CreateVM`, `*EditVM`, … |

---

## Repository

- Generic: `Repository<T>` / `IRepository<T>` với `T : class, IEntity` — CRUD, `GetQueryable()`, `Where()`, …
- Repository cụ thể: `{Name}Repository : Repository<{Entity}>, I{Name}Repository`, constructor `public XRepository(DbContext context) : base(context)`.
- **Đăng ký DI**: quét tự động các interface `I*Repository` trong namespace `Hinet.Repository` khớp class `*Repository` (xem `Startup.cs`).

---

## Truy vấn danh sách, tìm kiếm, phân trang

### Search (request)

- Mọi API lấy danh sách có lọc + phân trang nên có class `*Search : SearchBase`.
- `SearchBase` (`Hinet.Service.Dto.SearchBase`): `PageIndex`, `PageSize`, `SortColumn`, `SortOrder` (mặc định thường giống entity: `CreatedDate` / `desc`).
- Class search của feature thêm các field lọc: ví dụ `ForumTopicSearch` có `CategoryId`, `Title`, `ApprovalStatus`, `DiscussionStatus`, `AuthorUserId`, …

### Xây query trong Service

1. Bắt đầu từ `IQueryable` / EF: `GetQueryable()`, `_db.{DbSet}.AsNoTracking()`, hoặc LINQ `from ... join ...`.
2. Lọc điều kiện: `Where` theo từng field **chỉ khi** client gửi giá trị (chuỗi `IsNullOrEmpty`, `Guid? HasValue`, …).
3. Chuỗi tìm kiếm kiểu “chứa”: `EF.Functions.Like(x.Title, $"%{search.Title}%")` (tránh `Contains` khi cần behavior SQL rõ ràng).
4. **Sắp xếp & phân trang**: gọi `await PagedList<TDto>.CreateAsync(query, search)`.

### PagedList

- `PagedList<T>` (`Hinet.Service.Common.PagedList`):
  - `CreateAsync(IQueryable<T> query, SearchBase search)` — áp dụng **sort động** theo `SortColumn` / `SortOrder` (reflection), rồi `CountAsync`, `Skip`/`Take`.
  - Nếu trong service đã `OrderBy`/`OrderByDescending` cố định **trước** khi gọi `CreateAsync`, logic trong `PagedList` có thể **không** ghi đè order (xem `HasExistingOrderBy`) — cần thống nhất: hoặc để PagedList sort, hoặc sort cố định trong service (nhất quán với từng màn).

### Response

- Controller trả: `ApiResponse<PagedList<{Dto}>>.Ok(result)` cho `GetData`.
- JSON: ASP.NET Core serializer mặc định → property **PascalCase**; client Next thường normalize sang camelCase khi cần (xem `forumTopicService`).

---

## Truy vấn dữ liệu và join giữa các bảng

Phần này bổ sung **cách lấy `IQueryable`**, **join nhiều `DbSet`/repository**, và vài **lưu ý EF** để tránh query không dịch được hoặc kết quả sai — phù hợp với code hiện có trong `Hinet.Service`.

### Nguồn dữ liệu (`IQueryable`)

| Cách dùng | Khi nào | Ví dụ trong repo |
|-----------|---------|------------------|
| `I{Name}Repository.GetQueryable()` | Bắt đầu từ entity chính của feature, cùng `DbContext` với các repository khác | `QLVanBanService`: `from q in _vanBanRepository.GetQueryable()` |
| `HinetContext` inject vào Service | Cần nhiều `DbSet` forum, user, … không có repository riêng hoặc muốn gõ tường minh | `ForumTopicService`: `_db.ForumTopics.AsNoTracking()`, `_db.ForumCategories` |
| `_db.Set<TEntity>().AsNoTracking()` | Entity có trong model nhưng không expose qua property tiện | `ForumPortalService`: `_db.Set<AppUser>()` |

- **Đọc danh sách / báo cáo**: ưu tiên `AsNoTracking()` trên nhánh chỉ đọc để giảm overhead tracking.
- **Một transaction / một context**: các repository được tạo từ cùng `HinetContext` (scoped DI) nên join giữa `_repoA.GetQueryable()` và `_repoB.GetQueryable()` vẫn là **một** query graph — EF gộp thành SQL khi `IQueryable` còn “dính” nhau (chưa `ToList`/`ToListAsync` giữa chừng).

### Join trong LINQ (EF Core)

**INNER JOIN** — mỗi dòng bên trái chỉ giữ khi khớp bên phải:

```csharp
from q in nguonChinh
join c in nguonPhu on q.KhoaNgoai equals c.KhoaChinh
select new { q, c };
```

**LEFT OUTER JOIN** — giữ dòng chính kể cả không có bản ghi phụ (danh mục, user tùy chọn, …): dùng `into` + `DefaultIfEmpty()`:

```csharp
from q in nguonChinh
join c in nguonPhu on q.CategoryId equals c.Id into cj
from c in cj.DefaultIfEmpty()
select new { q, TenDanhMuc = c != null ? c.Name : null };
```

Mẫu này trùng với `ForumTopicService.GetData` / `GetDto` (topic ↔ category).

### Join nhiều bảng / cùng bảng danh mục nhiều lần

- **Nhiều cột FK trỏ vào cùng loại danh mục**: join `GetQueryable()` của `DanhMuc` (hoặc tương đương) **nhiều lần** với alias khác nhau — xem `QLVanBanService` (cơ quan ban hành, lĩnh vực, … cùng nguồn `_danhMucRepository`).
- **Lọc trên nhánh join trước `DefaultIfEmpty`**: ví dụ chỉ lấy ảnh mặc định khi join ảnh sản phẩm — `from groupImg in imgJoin.Where(x => x.IsMacDinh == true).DefaultIfEmpty()` trong `QLSP_SanPhamService.GetDataMap`.

### Khi không nên “ép” mọi thứ vào một query join

Một số tổ hợp `GroupBy` + `join` + `DefaultIfEmpty` EF **khó dịch** hoặc SQL sinh ra nặng. Trong repo có pattern **tách query** rồi ghép ở bộ nhớ:

- `ForumPortalService`: đếm like bằng query riêng (`GroupBy` → dictionary), comment trong code giải thích tránh join phức tạp.

Quy tắc thực tế: ưu tiên một `IQueryable` project ra DTO cho list/detail; nếu profiler/log báo lỗi dịch hoặc SQL quá phức tạp → **query 2 bước** (master list + lookup theo id) hoặc **raw SQL/Dapper** nếu module đã dùng (`DapperContext`, `DapperController`).

### Tham chiếu nhanh (join & truy vấn)

- Một `HinetContext` + join category: `Hinet.Service/ForumTopicService/ForumTopicService.cs`
- Join nhiều danh mục cùng repository: `Hinet.Service/QLVanBanService/QLVanBanService.cs`
- Join có điều kiện trên bảng phụ: `Hinet.Service/QLSP_SanPhamService/QLSP_SanPhamService.cs` (`GetDataMap`)
- Join + `Take(1)` trên nhóm phụ: `Hinet.Service/ThuongVuService/ThuongVuService.cs`
- Tách query tránh join EF “xấu”: `Hinet.Service/ForumPortalService/ForumPortalService.cs`

---

## Checklist khi thêm module API mới

1. Entity + `DbSet` trong `HinetContext` (nếu bảng mới).
2. `I{Name}Repository` + `{Name}Repository` (thường mỏng, chỉ kế thừa `Repository<>`).
3. `I{Name}Service` + `{Name}Service`; DTO + `*Search : SearchBase` + ViewModels cho Create/Update.
4. Controller với `GetData` (POST), CRUD theo pattern hiện có, bọc `ApiResponse<>`.
5. Build — không cần đăng ký tay nếu tuân quy tắc đặt tên `I{Name}Service`/`{Name}Service` và `I{Name}Repository`/`{Name}Repository`.

---

## Tham chiếu nhanh trong repo

- Chi tiết **truy vấn / join**: mục **Truy vấn dữ liệu và join giữa các bảng** (phần giữa tài liệu, sau *Response*).
- Controller + `ApiResponse`: `Hinet.Api/Controllers/ForumTopicController.cs`
- Service + join + `Like` + `PagedList`: `Hinet.Service/ForumTopicService/ForumTopicService.cs`
- `ForumTopicSearch`: `Hinet.Service/ForumTopicService/ViewModels/ForumTopicSearch.cs`
- `SearchBase`: `Hinet.Service/Dto/SearchBase.cs`
- `PagedList`: `Hinet.Service/Common/PagedList.cs`
- Đăng ký DI: `Hinet.Api/Startup.cs` → `AddDependencyInjection`
