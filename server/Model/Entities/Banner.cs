using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Banner hiển thị trên trang chủ / trang quảng cáo.
/// </summary>
[Table("Banners")]
public sealed class Banner : EntityBase
{
    /// <summary>Tiêu đề banner (dùng làm alt text).</summary>
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    /// <summary>Đường dẫn ảnh banner.</summary>
    [Required, MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    /// <summary>URL dẫn đến khi người dùng click vào banner (có thể null).</summary>
    [MaxLength(500)]
    public string? LinkUrl { get; set; }

    /// <summary>Mô tả ngắn về banner (hiển thị phụ hoặc dùng cho SEO).</summary>
    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>Thứ tự ưu tiên hiển thị — số nhỏ hiển thị trước.</summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>Bật / tắt hiển thị banner.</summary>
    public bool IsActive { get; set; } = true;

    /// <summary>Ngày bắt đầu hiển thị (null = không giới hạn).</summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>Ngày kết thúc hiển thị (null = không giới hạn).</summary>
    public DateTimeOffset? EndDate { get; set; }
}
