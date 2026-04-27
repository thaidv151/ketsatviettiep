using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.OrderModule;

namespace Api.Controllers.Portal;

[Authorize]
[ApiController]
[Route("api/portal/orders")]
public sealed class PortalOrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public PortalOrdersController(IOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        var userId = GetUserIdOrProblem();
        if (userId is null) return Unauthorized();
        var list = await _service.GetListForUserAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        var userId = GetUserIdOrProblem();
        if (userId is null) return Unauthorized();
        var item = await _service.GetDetailAsync(id, ct);
        if (item is null) return NotFound();
        if (item.UserId != userId) return Forbid();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreatePortalOrderRequest request, CancellationToken ct)
    {
        var userId = GetUserIdOrProblem();
        if (userId is null) return Unauthorized();
        try
        {
            var result = await _service.CreatePortalOrderAsync(userId.Value, request, ct);
            return Ok(new { orderId = result.OrderId, orderCode = result.OrderCode });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid? GetUserIdOrProblem()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var id))
            return null;
        return id;
    }
}
