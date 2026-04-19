using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.OrderModule;


namespace Api.Controllers.Portal;

[AllowAnonymous]
[ApiController]
[Route("api/portal/orders")]
public sealed class PortalOrdersController : ControllerBase
{
    private readonly IOrderService _service;

    public PortalOrdersController(IOrderService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetMyOrders(CancellationToken ct)
    {
        // For demonstration without auth, we'll just return the first few orders
        var list = await _service.GetListAsync(ct);
        return Ok(list.Take(5).ToList());
    }
    
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        var item = await _service.GetDetailAsync(id, ct);
        if (item is null) return NotFound();
        return Ok(item);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        // Dummy create method for portal
        return Ok(new { success = true, orderId = Guid.NewGuid() });
    }
}

public class CreateOrderRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public List<CartItemDto> Items { get; set; } = new();
}

public class CartItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
