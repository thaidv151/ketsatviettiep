# Chuẩn viết Controller (Backend API)

Lớp Controller (`server/Api/Controllers/`) làm nhiệm vụ tiếp nhận Request, gọi các phương thức tương ứng từ **Service** để xử lý logic nghiệp vụ và trả về Response.

## Quy ước đặt tên và cấu trúc cơ bản

- **Thư mục:** `server/Api/Controllers/Admin/`
- **Tên file:** `Admin[Entities]Controller.cs` 
- **Route:** `[Route("api/admin/[entities]")]`

## Các quy tắc quan trọng:

1. **Gọi Service:** Controller **KHÔNG** gọi trực tiếp Repository. Mọi thao tác dữ liệu phải thông qua lớp Service.
2. **Kế thừa ServiceBase:** Hầu hết các logic cơ bản (Create, Update, GetById) đã được xử lý trong `ServiceBase`. Controller chỉ việc gọi các hàm này.
3. **Kiểu dữ liệu trả về (Return Type):** Bắt buộc dùng `ActionResult<T>` để định nghĩa rõ contract với Frontend.
4. **Try-Catch & Logging:** Tất cả các action phải có `try-catch` và ghi log lỗi thông qua `_logger.LogError`.

## Ví dụ mẫu (`AdminCategoriesController.cs`):

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Services.CategoryModule;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/categories")]
public sealed class AdminCategoriesController : ControllerBase
{
    private readonly ICategoryService _service;
    private readonly ILogger<AdminCategoriesController> _logger;

    public AdminCategoriesController(ICategoryService service, ILogger<AdminCategoriesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryListDto>>> GetList(CancellationToken ct)
    {
        try
        {
            var result = await _service.GetAllAsync(ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi lấy danh sách Category");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDetailDto>> GetDetail(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await _service.GetByIdAsync(id, ct);
            return result == null ? NotFound() : Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi lấy chi tiết Category id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDetailDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetDetail), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi tạo mới Category");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<ActionResult<CategoryDetailDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _service.UpdateAsync(id, request, ct);
            return result == null ? NotFound() : Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi cập nhật Category id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, ct);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi xóa Category id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}
```

