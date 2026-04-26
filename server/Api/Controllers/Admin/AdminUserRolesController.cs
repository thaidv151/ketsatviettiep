using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Rbac;
using Services.Common;
namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/user-roles")]
public sealed class AdminUserRolesController : ControllerBase
{
    private readonly IUserRoleService _service;

    public AdminUserRolesController(IUserRoleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await _service.GetAllAsync(cancellationToken));

    [HttpGet("user/{userId:guid}")]
    public async Task<IActionResult> GetByUserId(Guid userId, CancellationToken cancellationToken)
        => Ok(await _service.GetByUserIdAsync(userId, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRoleRequest request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("user/{userId:guid}/set-roles")]
    public async Task<IActionResult> SetUserRoles(Guid userId, [FromBody] List<Guid> roleIds, CancellationToken cancellationToken)
    {
        await _service.SetUserRolesAsync(userId, roleIds, cancellationToken);
        return Ok(ApiResponse<string>.Ok("Thiết lập vai trò thành công"));
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, deletedById: null, cancellationToken);
        return NoContent();
    }
}
