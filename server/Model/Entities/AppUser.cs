using System.ComponentModel.DataAnnotations;

namespace Model.Entities;

public enum GenderEnum
{
    Unknown = 0,
    Male = 1,
    Female = 2,
    Other = 3,
}

public sealed class AppUser : EntityBase
{
    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>Tên đăng nhập (duy nhất). Dùng khi đăng nhập thay cho email; null với bản ghi cũ.</summary>
    [MaxLength(100)]
    public string? Username { get; set; }

    [MaxLength(256)]
    public string? FullName { get; set; }

    public DateTime? NgaySinh { get; set; }
    public int? Gender { get; set; }

    public string? Avatar { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    // Address
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? AddressDetail { get; set; }

    // Security
    public string? PasswordHash { get; set; }
    public bool EmailConfirmed { get; set; }
    public int AccessFailedCount { get; set; }
    public DateTime? LockoutEnd { get; set; }

    // System
    public bool IsLocked { get; set; }
    public bool IsFirstLogin { get; set; }
    public DateTime? LastLogin { get; set; }


}
