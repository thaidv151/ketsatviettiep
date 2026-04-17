using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.AppUserModule;
using Services.AppUserModule.Requests;

namespace Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AppUsersController : ControllerBase
{
    private readonly IAppUserService _appUserService;

    public AppUsersController(IAppUserService appUserService)
    {
        _appUserService = appUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllAsync(CancellationToken cancellationToken)
    {
        var list = await _appUserService.GetAllUsersAsync(cancellationToken);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _appUserService.GetUserDtoByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpGet("{id:guid}/detail")]
    public async Task<IActionResult> GetDetailAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _appUserService.GetUserDetailByIdAsync(id, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> UpdateAsync(Guid id, [FromBody] UpdateAppUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _appUserService.UpdateUserAsync(id, request, cancellationToken);
            return Ok(updated);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateAppUserRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Mật khẩu là bắt buộc." });

        try
        {
            var created = await _appUserService.CreateUserAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetByIdAsync), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        await _appUserService.DeleteAsync(id, deletedById: null, cancellationToken);
        return NoContent();
    }
}
