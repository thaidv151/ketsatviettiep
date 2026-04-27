using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.BannerModule;

namespace Api.Controllers.Portal;

[AllowAnonymous]
[ApiController]
[Route("api/portal/banners")]
public sealed class PortalBannersController : ControllerBase
{
    private readonly IBannerService _service;

    public PortalBannersController(IBannerService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
        => Ok(await _service.GetActiveForPortalAsync(ct));
}
