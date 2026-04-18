using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Biến thể sản phẩm — mỗi tổ hợp thuộc tính (màu + size...) tạo ra 1 biến thể.
/// Ví dụ: Áo size M - màu Đỏ là 1 biến thể.
/// </summary>
[Table("ProductVariants")]
public sealed class ProductVariant : EntityBase
{
    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    /// <summary>Mã SKU riêng của biến thể này.</summary>
    [Required, MaxLength(100)]
    public string Sku { get; set; } = string.Empty;

    /// <summary>Tên hiển thị biến thể (tự sinh hoặc nhập tay), ví dụ: "Đỏ / XL".</summary>
    [MaxLength(300)]
    public string? Name { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    /// <summary>Giá gốc (trước khuyến mãi) — null nghĩa là không có KM.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? OriginalPrice { get; set; }

    /// <summary>Số lượng tồn kho.</summary>
    public int StockQuantity { get; set; }

    /// <summary>Cảnh báo tồn kho thấp khi còn ≤ giá trị này.</summary>
    public int LowStockThreshold { get; set; } = 5;

    /// <summary>Trọng lượng (gram) — dùng cho tính phí vận chuyển.</summary>
    public int? WeightGram { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation — các thuộc tính tạo nên biến thể này
    public ICollection<ProductVariantAttributeValue> VariantAttributeValues { get; set; }
        = new List<ProductVariantAttributeValue>();

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
