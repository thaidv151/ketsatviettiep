using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Rbac;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/operations")]
public sealed class AdminOperationsController : ControllerBase
{
    private readonly IOperationService _service;

    public AdminOperationsController(IOperationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetByModuleId([FromQuery] Guid moduleId, CancellationToken cancellationToken)
    {
        if (moduleId == Guid.Empty)
            return BadRequest("moduleId is required.");
        return Ok(await _service.GetByModuleIdAsync(moduleId, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOperationRequest request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOperationRequest request, CancellationToken cancellationToken)
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
