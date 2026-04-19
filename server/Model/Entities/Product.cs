using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

public enum ProductStatus
{
    Draft = 0,
    Active = 1,
    OutOfStock = 2,
    Discontinued = 3,
}

/// <summary>
/// Sản phẩm — thông tin chung, chưa bao gồm biến thể (xem ProductVariant).
/// </summary>
[Table("Products")]
public sealed class Product : EntityBase
{
    public Guid CategoryId { get; set; }
    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    public Guid? BrandId { get; set; }
    [ForeignKey(nameof(BrandId))]
    public Brand? Brand { get; set; }

    [Required, MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Slug dùng cho URL thân thiện.</summary>
    [Required, MaxLength(350)]
    public string Slug { get; set; } = string.Empty;

    /// <summary>Mã SKU tổng quát (nếu không có biến thể).</summary>
    [MaxLength(100)]
    public string? Sku { get; set; }

    /// <summary>Mô tả ngắn hiển thị ở danh sách.</summary>
    [MaxLength(1000)]
    public string? ShortDescription { get; set; }

    /// <summary>Mô tả chi tiết (HTML/Markdown).</summary>
    public string? Description { get; set; }

    /// <summary>Giá gốc (giá niêm yết) — hiển thị khi không có biến thể riêng.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? BasePrice { get; set; }

    /// <summary>Giá sau khuyến mãi mặc định.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal? SalePrice { get; set; }

    /// <summary>Ảnh đại diện chính của sản phẩm.</summary>
    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }

    public ProductStatus Status { get; set; } = ProductStatus.Draft;

    /// <summary>Sản phẩm nổi bật / được ghim lên trang chủ.</summary>
    public bool IsFeatured { get; set; }

    /// <summary>Tổng số lượt xem.</summary>
    public long ViewCount { get; set; }

    // SEO
    [MaxLength(300)]
    public string? MetaTitle { get; set; }

    [MaxLength(500)]
    public string? MetaDescription { get; set; }

    [MaxLength(500)]
    public string? MetaKeywords { get; set; }

    // Thông số kỹ thuật chung (JSON)
    /// <summary>Thông số kỹ thuật dạng JSON key-value, ví dụ: { "Chất liệu": "Inox 304" }.</summary>
    public string? Specifications { get; set; }

    // Navigation

}
