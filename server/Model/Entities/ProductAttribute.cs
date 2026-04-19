using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Thuộc tính sản phẩm — định nghĩa loại thuộc tính (ví dụ: "Màu sắc", "Kích cỡ", "Chất liệu").
/// </summary>
[Table("ProductAttributes")]
public sealed class ProductAttribute : EntityBase
{
    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    /// <summary>Tên thuộc tính, ví dụ: "Màu sắc".</summary>
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Thuộc tính này dùng để tạo biến thể hay chỉ là thông số hiển thị.</summary>
    public bool IsVariantOption { get; set; } = true;

    public int SortOrder { get; set; }

    // Navigation

}
