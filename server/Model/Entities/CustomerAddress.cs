using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Địa chỉ giao hàng của khách hàng (có thể lưu nhiều địa chỉ).
/// </summary>
[Table("CustomerAddresses")]
public sealed class CustomerAddress : EntityBase
{
    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public AppUser User { get; set; } = null!;

    [Required, MaxLength(200)]
    public string RecipientName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Province { get; set; }

    [MaxLength(100)]
    public string? District { get; set; }

    [MaxLength(100)]
    public string? Ward { get; set; }

    [Required, MaxLength(500)]
    public string AddressDetail { get; set; } = string.Empty;

    /// <summary>Địa chỉ mặc định khi đặt hàng.</summary>
    public bool IsDefault { get; set; }
}
