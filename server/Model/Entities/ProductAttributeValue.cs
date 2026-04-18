using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Giá trị cụ thể của một thuộc tính (ví dụ: "Đỏ", "XL", "Inox").
/// </summary>
[Table("ProductAttributeValues")]
public sealed class ProductAttributeValue : EntityBase
{
    public Guid AttributeId { get; set; }
    [ForeignKey(nameof(AttributeId))]
    public ProductAttribute Attribute { get; set; } = null!;

    /// <summary>Giá trị, ví dụ: "Đỏ" hoặc "XL".</summary>
    [Required, MaxLength(200)]
    public string Value { get; set; } = string.Empty;

    /// <summary>Mã màu hex (chỉ dùng khi thuộc tính là màu sắc).</summary>
    [MaxLength(20)]
    public string? ColorHex { get; set; }

    public int SortOrder { get; set; }
}
