using System.Security.Claims;
using Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Services.AppUserModule;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;

namespace Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly JwtTokenService _jwt;
    private readonly JwtOptions _jwtOptions;
    private readonly IAppUserService _appUserService;

    public AuthController(
        JwtTokenService jwt,
        IOptions<JwtOptions> jwtOptions,
        IAppUserService appUserService)
    {
        _jwt = jwt;
        _jwtOptions = jwtOptions.Value;
        _appUserService = appUserService;
    }

    /// <summary>
    /// Đăng nhập bằng email/mật khẩu, xác thực password hash trong DB.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest body, CancellationToken cancellationToken)
    {
        var identifier = !string.IsNullOrWhiteSpace(body.Username)
            ? body.Username.Trim()
            : body.Email?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(identifier))
            return BadRequest(new { message = "Nhập email hoặc tên đăng nhập." });
        if (string.IsNullOrWhiteSpace(body.Password))
            return BadRequest(new { message = "Mật khẩu là bắt buộc." });

        var user = await _appUserService.GetByLoginAsync(identifier, cancellationToken);
        if (user is null || !AppUserPasswordHasher.VerifyPassword(body.Password, user.PasswordHash))
            return Unauthorized(new { message = "Email/tên đăng nhập hoặc mật khẩu không đúng." });
        if (user.IsLocked)
            return Unauthorized(new { message = "Tài khoản đang bị khóa." });

        user.LastLogin = DateTime.UtcNow;
        user.IsFirstLogin = false;
        user.AccessFailedCount = 0;
        await _appUserService.UpdateAsync(user, cancellationToken);

        var accessToken = _jwt.CreateAccessToken(user.Id, user.Email);
        var info = await _appUserService.GetUserInfoAsync(user.Id, cancellationToken);

        return Ok(new
        {
            accessToken,
            tokenType = "Bearer",
            expiresIn = _jwtOptions.ExpiresMinutes * 60,
            user = info?.User,
            menuItems = info?.MenuItems
        });
    }

    /// <summary>Đăng ký tài khoản công khai (không cần đăng nhập quản trị).</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body.Email))
            return BadRequest(new { message = "Email là bắt buộc." });
        if (string.IsNullOrWhiteSpace(body.Username))
            return BadRequest(new { message = "Tên đăng nhập là bắt buộc." });
        if (string.IsNullOrWhiteSpace(body.Password))
            return BadRequest(new { message = "Mật khẩu là bắt buộc." });
        if (!string.Equals(body.Password, body.ConfirmPassword, StringComparison.Ordinal))
            return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });

        var create = new CreateAppUserRequest
        {
            Email = body.Email.Trim(),
            Username = body.Username.Trim(),
            Password = body.Password,
            FullName = string.IsNullOrWhiteSpace(body.FullName) ? null : body.FullName.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(body.PhoneNumber) ? null : body.PhoneNumber.Trim(),
        };

        try
        {
            var created = await _appUserService.CreateAsync(create);
            return Ok(new { id = created.Id, email = created.Email, username = created.Username });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Thông tin user hiện tại (cần header Authorization: Bearer ...).</summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
            return Unauthorized();

        var info = await _appUserService.GetUserInfoAsync(userId, cancellationToken);
        return info is null ? NotFound() : Ok(info);
    }
}
