using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

public enum OrderStatus
{
    Pending = 0,          // Chờ xác nhận
    Confirmed = 1,        // Đã xác nhận
    Processing = 2,       // Đang xử lý / chuẩn bị hàng
    Shipped = 3,          // Đã giao vận chuyển
    Delivered = 4,        // Đã giao thành công
    Cancelled = 5,        // Đã hủy
    ReturnRequested = 6,  // Yêu cầu hoàn trả
    Returned = 7,         // Đã hoàn trả
    Refunded = 8,         // Đã hoàn tiền
}

public enum PaymentStatus
{
    Unpaid = 0,
    Paid = 1,
    PartiallyPaid = 2,
    Refunded = 3,
    Failed = 4,
}

public enum PaymentMethod
{
    COD = 0,           // Tiền mặt khi nhận hàng
    BankTransfer = 1,  // Chuyển khoản ngân hàng
    VnPay = 2,
    MoMo = 3,
    ZaloPay = 4,
    CreditCard = 5,
}

/// <summary>
/// Đơn hàng — snapshot giá tại thời điểm mua.
/// </summary>
[Table("Orders")]
public sealed class Order : EntityBase
{
    /// <summary>Số đơn hàng hiển thị cho khách (ví dụ: ORD-20260418-00001).</summary>
    [Required, MaxLength(50)]
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>Null = khách vãng lai (guest checkout).</summary>
    public Guid? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public AppUser? User { get; set; }

    // ---- Thông tin người nhận (snapshot tại thời điểm đặt) ----
    [Required, MaxLength(200)]
    public string RecipientName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string RecipientPhone { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Province { get; set; }

    [MaxLength(100)]
    public string? District { get; set; }

    [MaxLength(100)]
    public string? Ward { get; set; }

    [Required, MaxLength(500)]
    public string AddressDetail { get; set; } = string.Empty;

    // ---- Giá trị đơn hàng ----
    /// <summary>Tổng tiền hàng (chưa có phí ship, chưa giảm giá).</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal SubTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ShippingFee { get; set; }

    /// <summary>Tổng số tiền giảm từ coupon / khuyến mãi.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal DiscountAmount { get; set; }

    /// <summary>Số tiền phải thanh toán = SubTotal + ShippingFee - DiscountAmount.</summary>
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    // ---- Trạng thái ----
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.COD;

    // ---- Coupon ----
    public Guid? CouponId { get; set; }
    [ForeignKey(nameof(CouponId))]
    public Coupon? Coupon { get; set; }

    [MaxLength(50)]
    public string? CouponCode { get; set; }

    // ---- Vận chuyển ----
    [MaxLength(100)]
    public string? ShippingProvider { get; set; }

    [MaxLength(100)]
    public string? TrackingNumber { get; set; }

    public DateTimeOffset? ShippedAt { get; set; }

    public DateTimeOffset? DeliveredAt { get; set; }

    // ---- Ghi chú ----
    [MaxLength(1000)]
    public string? CustomerNote { get; set; }

    [MaxLength(1000)]
    public string? InternalNote { get; set; }

    /// <summary>Lý do hủy đơn (nếu bị hủy).</summary>
    [MaxLength(500)]
    public string? CancelReason { get; set; }

    public DateTimeOffset? CancelledAt { get; set; }

    // Navigation

}
