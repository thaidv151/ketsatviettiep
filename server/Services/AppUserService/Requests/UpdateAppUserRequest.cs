using System.ComponentModel.DataAnnotations;

namespace Services.AppUserModule.Requests;

public sealed class UpdateAppUserRequest
{
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(3), MaxLength(100)]
    [RegularExpression(@"^[a-zA-Z0-9._-]{3,100}$", ErrorMessage = "Tên đăng nhập chỉ gồm chữ, số, . _ - (3–100 ký tự).")]
    public string Username { get; set; } = string.Empty;

    public string? FullName { get; set; }

    public DateTime? NgaySinh { get; set; }

    public int? Gender { get; set; }

    public string? Avatar { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Province { get; set; }

    public string? District { get; set; }

    public string? Ward { get; set; }

    public string? AddressDetail { get; set; }

    public string? NewPassword { get; set; }

    public bool EmailConfirmed { get; set; }

    public bool IsLocked { get; set; }

    public bool IsFirstLogin { get; set; }
}
