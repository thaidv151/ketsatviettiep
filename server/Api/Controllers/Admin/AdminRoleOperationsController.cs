using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Rbac;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/role-operations")]
public sealed class AdminRoleOperationsController : ControllerBase
{
    private readonly IRoleOperationService _service;

    public AdminRoleOperationsController(IRoleOperationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await _service.GetAllAsync(cancellationToken));

    [HttpGet("role/{roleId:guid}")]
    public async Task<IActionResult> GetByRoleId(Guid roleId, CancellationToken cancellationToken)
        => Ok(await _service.GetByRoleIdAsync(roleId, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleOperationRequest request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("role/{roleId:guid}/set-permissions")]
    public async Task<IActionResult> SetRoleOperations(Guid roleId, [FromBody] List<Guid> operationIds, CancellationToken cancellationToken)
    {
        await _service.SetRoleOperationsAsync(roleId, operationIds, cancellationToken);
        return Ok(ApiResponse<string>.Ok("Thiết lập quyền thành công"));
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleOperationRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, request, cancellationToken);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _service.DeleteAsync(id, deletedById: null, cancellationToken);
        return NoContent();
    }
}
