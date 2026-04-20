using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Services.AppUserModule;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AppUsersController : ControllerBase
{
    private readonly IAppUserService _appUserService;
    private readonly ILogger<AppUsersController> _logger;

    public AppUsersController(IAppUserService appUserService, ILogger<AppUsersController> logger)
    {
        _appUserService = appUserService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppUserDto>>> GetAllAsync(CancellationToken cancellationToken)
    {
        try
        {
            var list = await _appUserService.GetAllAsync(cancellationToken);
            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách người dùng");
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AppUserDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _appUserService.GetByIdAsync(id, cancellationToken);
            return user is null ? NotFound() : Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy người dùng id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpGet("{id:guid}/detail")]
    public async Task<ActionResult<AppUserDetailDto>> GetDetailAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _appUserService.GetUserDetailByIdAsync(id, cancellationToken);
            return user is null ? NotFound() : Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết người dùng id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<ActionResult<AppUserDto>> UpdateAsync(Guid id, [FromBody] UpdateAppUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _appUserService.UpdateAsync(id, request, cancellationToken);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật người dùng id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<AppUserDto>> CreateAsync([FromBody] CreateAppUserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Mật khẩu là bắt buộc." });

        try
        {
            var created = await _appUserService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo mới người dùng: {Email}", request.Email);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<ActionResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _appUserService.DeleteAsync(id, deletedById: null, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa người dùng id: {Id}", id);
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}
