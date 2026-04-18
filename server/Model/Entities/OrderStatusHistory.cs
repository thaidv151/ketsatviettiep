using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

/// <summary>
/// Lịch sử thay đổi trạng thái đơn hàng — audit trail.
/// </summary>
[Table("OrderStatusHistories")]
public sealed class OrderStatusHistory : EntityBase
{
    public Guid OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    public OrderStatus FromStatus { get; set; }

    public OrderStatus ToStatus { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    /// <summary>Người thực hiện thay đổi (null = hệ thống tự động).</summary>
    public Guid? ChangedById { get; set; }
}
