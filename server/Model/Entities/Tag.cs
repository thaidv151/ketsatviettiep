using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Tag sản phẩm — dùng cho tìm kiếm và nhóm sản phẩm linh hoạt.
/// </summary>
[Table("Tags")]
public sealed class Tag : EntityBase
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Slug { get; set; } = string.Empty;

    // Navigation
    public ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
}

/// <summary>
/// Bảng nối Product — Tag (N-N).
/// </summary>
[Table("ProductTags")]
public sealed class ProductTag
{
    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    public Guid TagId { get; set; }
    [ForeignKey(nameof(TagId))]
    public Tag Tag { get; set; } = null!;
}
