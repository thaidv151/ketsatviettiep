using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.BannerModule;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/banners")]
public sealed class AdminBannersController : ControllerBase
{
    private readonly IBannerService _service;
    private readonly ILogger<AdminBannersController> _logger;

    public AdminBannersController(IBannerService service, ILogger<AdminBannersController> logger)
    {
        _service = service;
        _logger  = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        try
        {
            var result = await _service.GetAllAsync(ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi lấy danh sách Banner");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        try
        {
            var item = await _service.GetByIdAsync(id, ct);
            return item is null ? NotFound() : Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi lấy chi tiết Banner id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBannerRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi tạo mới Banner");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBannerRequest request, CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi cập nhật Banner id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteAsync(id, deletedById: null, ct);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi hệ thống khi xóa Banner id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}
