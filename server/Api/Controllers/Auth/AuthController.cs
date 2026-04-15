using System.Security.Claims;
using Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly JwtTokenService _jwt;
    private readonly JwtOptions _jwtOptions;

    public AuthController(JwtTokenService jwt, IOptions<JwtOptions> jwtOptions)
    {
        _jwt = jwt;
        _jwtOptions = jwtOptions.Value;
    }

    /// <summary>
    /// Demo đăng nhập — trả JWT. Sau này thay bằng kiểm tra user/password + DB.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Email))
            return BadRequest(new { message = "Email là bắt buộc." });

        var userId = Guid.NewGuid();
        var accessToken = _jwt.CreateAccessToken(userId, body.Email.Trim());
        return Ok(new
        {
            accessToken,
            tokenType = "Bearer",
            expiresIn = _jwtOptions.ExpiresMinutes * 60,
        });
    }

    /// <summary>Kiểm tra token hiện tại (cần header Authorization: Bearer ...).</summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        return Ok(new
        {
            sub = User.FindFirstValue(ClaimTypes.NameIdentifier),
            email = User.FindFirstValue(ClaimTypes.Email),
        });
    }
}
