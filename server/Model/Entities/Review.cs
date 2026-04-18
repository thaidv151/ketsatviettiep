using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Đánh giá / review sản phẩm từ khách hàng.
/// </summary>
[Table("Reviews")]
public sealed class Review : EntityBase
{
    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;

    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public AppUser User { get; set; } = null!;

    /// <summary>Liên kết với đơn hàng đã mua để xác thực "đã mua hàng".</summary>
    public Guid? OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public Order? Order { get; set; }

    /// <summary>Điểm đánh giá từ 1 đến 5.</summary>
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Content { get; set; }

    /// <summary>Danh sách URL ảnh đính kèm (JSON array).</summary>
    public string? ImageUrls { get; set; }

    /// <summary>Admin đã duyệt review này chưa.</summary>
    public bool IsApproved { get; set; }

    public DateTimeOffset? ApprovedAt { get; set; }

    public Guid? ApprovedById { get; set; }
}
