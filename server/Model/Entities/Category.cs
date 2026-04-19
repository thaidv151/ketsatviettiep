using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Danh mục sản phẩm — hỗ trợ cây phân cấp (cha-con).
/// </summary>
[Table("Categories")]
public sealed class Category : EntityBase
{
    /// <summary>Danh mục cha (null = danh mục gốc).</summary>
    public Guid? ParentId { get; set; }

    [ForeignKey(nameof(ParentId))]
    public Category? Parent { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Slug dùng cho URL, ví dụ: "khoa-cua-van-tay".</summary>
    [Required, MaxLength(250)]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>Đường dẫn ảnh thumbnail của danh mục.</summary>
    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    // Navigation

}
