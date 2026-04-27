using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Services.CategoryModule;
using Services.Common;

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

    /// <summary>Danh sách có lọc + phân trang. Query: Query, ParentId, IsActive, RootOnly, PageIndex, PageSize, …</summary>
    [HttpGet]
    public async Task<ActionResult<PagedList<CategoryDto>>> GetList(
        [FromQuery] CategorySearch? search,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetDataAsync(search ?? new CategorySearch(), ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách danh mục");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    /// <summary>Giống <see cref="GetList"/> nhưng nhận body (tiện cho bộ lọc phức tạp), cùng mẫu với <c>DanhMuc/GetData</c>.</summary>
    [HttpPost("GetData")]
    public async Task<ActionResult<PagedList<CategoryDto>>> GetData(
        [FromBody] CategorySearch? search,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.GetDataAsync(search ?? new CategorySearch(), ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách danh mục (GetData)");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken ct)
    {
        try
        {
            var item = await _service.GetByIdAsync(id, ct);
            return item is null ? NotFound() : Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh mục id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo mới danh mục");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật danh mục id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, deletedById: null, ct);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa danh mục id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}
