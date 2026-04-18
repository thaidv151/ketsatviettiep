using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Chi tiết từng dòng sản phẩm trong đơn hàng — snapshot tên/giá tại thời điểm mua.
/// </summary>
[Table("OrderItems")]
public sealed class OrderItem : EntityBase
{
    public Guid OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    public Guid? VariantId { get; set; }
    [ForeignKey(nameof(VariantId))]
    public ProductVariant? Variant { get; set; }

    // Snapshot thông tin tại thời điểm mua
    [Required, MaxLength(300)]
    public string ProductName { get; set; } = string.Empty;

    /// <summary>Tên biến thể (ví dụ: "Đỏ / XL"), snapshot.</summary>
    [MaxLength(300)]
    public string? VariantName { get; set; }

    [MaxLength(100)]
    public string? Sku { get; set; }

    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    /// <summary>Giảm giá trực tiếp trên dòng (ví dụ: flash sale item).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    public int Quantity { get; set; }

    /// <summary>Thành tiền = (UnitPrice - DiscountAmount) * Quantity.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }
}
