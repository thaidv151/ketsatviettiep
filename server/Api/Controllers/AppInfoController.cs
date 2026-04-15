using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.AppInfo;

namespace Api.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AppInfoController : ControllerBase
{
    private readonly IAppInfoService _appInfoService;

    public AppInfoController(IAppInfoService appInfoService)
    {
        _appInfoService = appInfoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAsync(CancellationToken cancellationToken)
    {
        var info = await _appInfoService.GetAppInfoAsync(cancellationToken);
        return Ok(info);
    }
}
