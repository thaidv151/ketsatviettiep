using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.OrderModule;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/orders")]
public sealed class AdminOrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public AdminOrdersController(IOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
        => Ok(await _service.GetListAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        var item = await _service.GetDetailAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateStatusAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/note")]
    public async Task<IActionResult> UpdateNote(Guid id, [FromBody] UpdateOrderNoteRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateNoteAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, deletedById: null, ct);
        return NoContent();
    }
}
