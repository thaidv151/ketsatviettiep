namespace Api.Controllers.Auth;

/// <summary>Cập nhật hồ sơ tài khoản (người dùng tự sửa). Tên đăng nhập không đổi từ API; đổi mật khẩu cần mật khẩu hiện tại.</summary>
public sealed class UpdateProfileRequest
{
    public string Email { get; set; } = string.Empty;

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public DateTime? NgaySinh { get; set; }

    public int? Gender { get; set; }

    public string? Avatar { get; set; }

    public string? Province { get; set; }

    public string? Ward { get; set; }

    public string? AddressDetail { get; set; }

    public string? NewPassword { get; set; }

    public string? ConfirmNewPassword { get; set; }

    /// <summary>Bắt buộc khi gửi <see cref="NewPassword"/> — xác thực trước khi đổi mật khẩu.</summary>
    public string? CurrentPassword { get; set; }
}
