using System.Security.Claims;
using Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Model.Entities;
using Repositories.AppUserRepository;
using Services.AppUserModule;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Rbac;

namespace Api.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private const string DefaultRegisteredUserRoleCode = "NGUOIDUNG";

    private readonly JwtTokenService _jwt;
    private readonly JwtOptions _jwtOptions;
    private readonly IAppUserService _appUserService;
    private readonly IAppUserRepository _appUserRepository;
    private readonly IRoleService _roleService;
    private readonly IUserRoleService _userRoleService;

    public AuthController(
        JwtTokenService jwt,
        IOptions<JwtOptions> jwtOptions,
        IAppUserService appUserService,
        IAppUserRepository appUserRepository,
        IRoleService roleService,
        IUserRoleService userRoleService)
    {
        _jwt = jwt;
        _jwtOptions = jwtOptions.Value;
        _appUserService = appUserService;
        _appUserRepository = appUserRepository;
        _roleService = roleService;
        _userRoleService = userRoleService;
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
            menuItems = info?.MenuItems,
            roleCodes = info?.RoleCodes ?? Array.Empty<string>(),
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

        var defaultRole = await _roleService.GetByCodeAsync(DefaultRegisteredUserRoleCode, cancellationToken);
        if (defaultRole is null)
        {
            return StatusCode(500, new
            {
                message = "Hệ thống chưa cấu hình vai trò NGUOIDUNG (hoặc đang tắt). Liên hệ quản trị.",
            });
        }

        try
        {
            var created = await _appUserService.CreateAsync(create, cancellationToken);
            await _userRoleService.SetUserRolesAsync(created.Id, [defaultRole.Id], cancellationToken);
            return Ok(new { id = created.Id, email = created.Email, username = created.Username });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("đã tồn tại", StringComparison.Ordinal))
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Chi tiết hồ sơ (địa chỉ, ngày sinh, …) cho user đang đăng nhập.</summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
            return Unauthorized();

        var detail = await _appUserService.GetUserDetailByIdAsync(userId, cancellationToken);
        return detail is null ? NotFound() : Ok(detail);
    }

    /// <summary>Cập nhật hồ sơ: không cho tự bật isLocked, emailConfirmed, … (chỉ từ quản trị).</summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest body,
        CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(sub) || !Guid.TryParse(sub, out var userId))
            return Unauthorized();
        if (string.IsNullOrWhiteSpace(body.Email))
            return BadRequest(new { message = "Email là bắt buộc." });
        if (!string.IsNullOrWhiteSpace(body.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(body.ConfirmNewPassword) ||
                !string.Equals(body.NewPassword, body.ConfirmNewPassword, StringComparison.Ordinal))
                return BadRequest(new { message = "Mật khẩu mới và xác nhận không khớp." });
            if (body.NewPassword.Length < 6)
                return BadRequest(new { message = "Mật khẩu mới tối thiểu 6 ký tự." });
            if (string.IsNullOrWhiteSpace(body.CurrentPassword))
                return BadRequest(new { message = "Nhập mật khẩu hiện tại để đổi mật khẩu." });
        }

        var appUser = await _appUserRepository.GetByIdAsync(userId, cancellationToken);
        if (appUser is null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(body.NewPassword))
        {
            if (string.IsNullOrEmpty(appUser.PasswordHash) ||
                !AppUserPasswordHasher.VerifyPassword(body.CurrentPassword!, appUser.PasswordHash))
                return Unauthorized(new { message = "Mật khẩu hiện tại không đúng." });
        }

        var loginUsername = ResolveUsernameForUpdate(appUser);

        var update = new UpdateAppUserRequest
        {
            Email = body.Email.Trim(),
            Username = loginUsername,
            FullName = string.IsNullOrWhiteSpace(body.FullName) ? null : body.FullName.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(body.PhoneNumber) ? null : body.PhoneNumber.Trim(),
            NgaySinh = body.NgaySinh,
            Gender = body.Gender,
            Avatar = string.IsNullOrWhiteSpace(body.Avatar) ? null : body.Avatar.Trim(),
            Province = string.IsNullOrWhiteSpace(body.Province) ? null : body.Province.Trim(),
            District = null,
            Ward = string.IsNullOrWhiteSpace(body.Ward) ? null : body.Ward.Trim(),
            AddressDetail = string.IsNullOrWhiteSpace(body.AddressDetail) ? null : body.AddressDetail.Trim(),
            NewPassword = string.IsNullOrWhiteSpace(body.NewPassword) ? null : body.NewPassword,
            EmailConfirmed = appUser.EmailConfirmed,
            IsLocked = appUser.IsLocked,
            IsFirstLogin = appUser.IsFirstLogin,
        };

        try
        {
            var updated = await _appUserService.UpdateAsync(userId, update, cancellationToken);
            if (updated is null)
                return NotFound();
            var detail = await _appUserService.GetUserDetailByIdAsync(userId, cancellationToken);
            return detail is null ? NotFound() : Ok(detail);
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

    /// <summary>Giữ tên đăng nhập trong DB; fallback an toàn nếu bản ghi cũ chưa có.</summary>
    private static string ResolveUsernameForUpdate(AppUser appUser)
    {
        if (!string.IsNullOrWhiteSpace(appUser.Username) && appUser.Username.Trim().Length >= 3)
            return appUser.Username.Trim();
        return appUser.Id.ToString("N");
    }
}
