using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.CouponModule;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/coupons")]
public sealed class AdminCouponsController : ControllerBase
{
    private readonly ICouponService _service;

    public AdminCouponsController(ICouponService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var item = await _service.GetByIdAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCouponRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCouponRequest request, CancellationToken ct)
    {
        var updated = await _service.UpdateAsync(id, request, ct);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, deletedById: null, ct);
        return NoContent();
    }
}
