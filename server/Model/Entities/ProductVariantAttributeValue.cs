using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Bảng nối giữa ProductVariant và ProductAttributeValue.
/// Cho biết biến thể này có những giá trị thuộc tính nào (ví dụ: Đỏ + XL).
/// </summary>
[Table("ProductVariantAttributeValues")]
public sealed class ProductVariantAttributeValue
{
    public Guid VariantId { get; set; }
    [ForeignKey(nameof(VariantId))]
    public ProductVariant Variant { get; set; } = null!;

    public Guid AttributeValueId { get; set; }
    [ForeignKey(nameof(AttributeValueId))]
    public ProductAttributeValue AttributeValue { get; set; } = null!;
}
