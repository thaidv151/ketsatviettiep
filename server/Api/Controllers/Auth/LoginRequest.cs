namespace Api.Controllers.Auth;

public sealed class LoginRequest
{
    /// <summary>Đăng nhập bằng email (tùy chọn nếu có username).</summary>
    public string? Email { get; set; }

    /// <summary>Đăng nhập bằng tên đăng nhập.</summary>
    public string? Username { get; set; }

    public string Password { get; set; } = string.Empty;
}
