using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

public enum PaymentTransactionStatus
{
    Pending = 0,
    Success = 1,
    Failed = 2,
    Cancelled = 3,
}

/// <summary>
/// Giao dịch thanh toán cho đơn hàng (hỗ trợ nhiều lần thanh toán / hoàn tiền).
/// </summary>
[Table("Payments")]
public sealed class Payment : EntityBase
{
    public Guid OrderId { get; set; }
    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;

    public PaymentMethod Method { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public PaymentTransactionStatus Status { get; set; } = PaymentTransactionStatus.Pending;

    /// <summary>Mã giao dịch từ cổng thanh toán bên thứ ba.</summary>
    [MaxLength(200)]
    public string? TransactionId { get; set; }

    /// <summary>Dữ liệu phản hồi thô từ cổng thanh toán (JSON).</summary>
    public string? GatewayResponse { get; set; }

    public DateTimeOffset? PaidAt { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
