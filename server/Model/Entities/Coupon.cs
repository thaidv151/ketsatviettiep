using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

public enum DiscountType
{
    Percentage = 0,   // Giảm theo %
    FixedAmount = 1,  // Giảm số tiền cố định
    FreeShipping = 2, // Miễn phí vận chuyển
}

/// <summary>
/// Mã giảm giá / coupon.
/// </summary>
[Table("Coupons")]
public sealed class Coupon : EntityBase
{
    [Required, MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DiscountType DiscountType { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountValue { get; set; }

    /// <summary>Giá trị đơn hàng tối thiểu để áp dụng mã.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MinOrderAmount { get; set; }

    /// <summary>Giảm tối đa (áp dụng khi giảm theo %).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? MaxDiscountAmount { get; set; }

    /// <summary>Tổng số lần được phép dùng (null = không giới hạn).</summary>
    public int? UsageLimit { get; set; }

    /// <summary>Số lần đã dùng.</summary>
    public int UsedCount { get; set; }

    /// <summary>Mỗi người dùng được dùng tối đa bao nhiêu lần.</summary>
    public int? PerUserLimit { get; set; }

    public DateTimeOffset? StartAt { get; set; }

    public DateTimeOffset? ExpiredAt { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
