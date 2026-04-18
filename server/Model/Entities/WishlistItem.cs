using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Danh sách yêu thích (Wishlist) của người dùng.
/// </summary>
[Table("WishlistItems")]
public sealed class WishlistItem : EntityBase
{
    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public AppUser User { get; set; } = null!;

    public Guid ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;
}
