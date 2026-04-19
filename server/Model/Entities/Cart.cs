using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Giỏ hàng — lưu trữ phía server, hỗ trợ cả user đã đăng nhập và guest.
/// </summary>
[Table("Carts")]
public sealed class Cart : EntityBase
{
    /// <summary>Null = giỏ hàng của khách vãng lai (dùng SessionId).</summary>
    public Guid? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public AppUser? User { get; set; }

    /// <summary>Token định danh giỏ hàng cho guest (cookie).</summary>
    [MaxLength(100)]
    public string? SessionId { get; set; }

    public DateTimeOffset? ExpiredAt { get; set; }

    // Navigation

}

/// <summary>
/// Dòng sản phẩm trong giỏ hàng.
/// </summary>
[Table("CartItems")]
public sealed class CartItem : EntityBase
{
    public Guid CartId { get; set; }
    [ForeignKey(nameof(CartId))]
    public Cart Cart { get; set; } = null!;

    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    public Guid? VariantId { get; set; }
    [ForeignKey(nameof(VariantId))]
    public ProductVariant? Variant { get; set; }

    public int Quantity { get; set; }
}
