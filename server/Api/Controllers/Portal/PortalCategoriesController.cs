using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.CategoryModule;

namespace Api.Controllers.Portal;

[AllowAnonymous]
[ApiController]
[Route("api/portal/categories")]
public sealed class PortalCategoriesController : ControllerBase
{
    private readonly ICategoryService _service;

    public PortalCategoriesController(ICategoryService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
        => Ok(await _service.GetAllAsync(ct));
}
