using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Ảnh sản phẩm (thư viện ảnh).
/// </summary>
[Table("ProductImages")]
public sealed class ProductImage : EntityBase
{
    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    /// <summary>Liên kết đến biến thể cụ thể (null = ảnh chung của sản phẩm).</summary>
    public Guid? VariantId { get; set; }
    [ForeignKey(nameof(VariantId))]
    public ProductVariant? Variant { get; set; }

    [Required, MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? AltText { get; set; }

    /// <summary>Ảnh đại diện chính của sản phẩm.</summary>
    public bool IsPrimary { get; set; }

    public int SortOrder { get; set; }
}
