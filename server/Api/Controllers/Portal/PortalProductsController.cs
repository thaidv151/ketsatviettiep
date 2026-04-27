using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.ProductModule;

namespace Api.Controllers.Portal;

[AllowAnonymous]
[ApiController]
[Route("api/portal/products")]
public sealed class PortalProductsController : ControllerBase
{
    private readonly IProductService _service;

    public PortalProductsController(IProductService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
    {
        var list = await _service.GetListAsync(ct);
        return Ok(list.Where(p => p.Status == 1).ToList()); // Only active products
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<IActionResult> GetDetailBySlug(string slug, CancellationToken ct)
    {
        var item = await _service.GetDetailBySlugAsync(slug, ct);
        if (item is null || item.Status != 1) return NotFound();
        return Ok(item);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        var item = await _service.GetDetailAsync(id, ct);
        if (item is null || item.Status != 1) return NotFound();
        return Ok(item);
    }
}
