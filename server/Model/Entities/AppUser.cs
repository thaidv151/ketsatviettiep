using System.ComponentModel.DataAnnotations;

namespace Model.Entities;

public sealed class AppUser : EntityBase
{
    [Required]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? DisplayName { get; set; }

    [MaxLength(500)]
    public string? Name { get; set; }

    public DateTime? NgaySinh { get; set; }

    public int Gender { get; set; }

    [MaxLength(2000)]
    public string? Picture { get; set; }

    public Guid? MaDonVi { get; set; }

    public Guid? DonViId { get; set; }

    public Guid? CongTyThanhVienId { get; set; }

    [MaxLength(500)]
    public string? DiaChi { get; set; }

    public bool? IsUpdateNewPass { get; set; }

    public bool? IsFirstLogin { get; set; }

    public DateTime? ChangePasswordDate { get; set; }

    public bool? IsLock { get; set; }

    [MaxLength(500)]
    public string? PasswordHash { get; set; }
}
