using Model.Entities;

namespace Services.OrderModule;

// ── Order Item DTO ────────────────────────────────────────────────────────────

public sealed record OrderItemDto(
    Guid Id,
    Guid ProductId,
    Guid? VariantId,
    string ProductName,
    string? VariantName,
    string? Sku,
    string? ThumbnailUrl,
    decimal UnitPrice,
    decimal DiscountAmount,
    int Quantity,
    decimal SubTotal);

// ── Payment DTO ───────────────────────────────────────────────────────────────

public sealed record PaymentDto(
    Guid Id,
    int Method,
    string MethodLabel,
    decimal Amount,
    int Status,
    string StatusLabel,
    string? TransactionId,
    DateTimeOffset? PaidAt);

// ── Status History DTO ────────────────────────────────────────────────────────

public sealed record OrderStatusHistoryDto(
    Guid Id,
    int FromStatus,
    int ToStatus,
    string ToStatusLabel,
    string? Note,
    Guid? ChangedById,
    DateTimeOffset CreatedAt);

// ── Order list DTO ────────────────────────────────────────────────────────────

public sealed record OrderListDto(
    Guid Id,
    string OrderCode,
    Guid? UserId,
    string RecipientName,
    string RecipientPhone,
    decimal TotalAmount,
    int Status,
    string StatusLabel,
    int PaymentStatus,
    string PaymentStatusLabel,
    int PaymentMethod,
    string PaymentMethodLabel,
    int ItemCount,
    DateTimeOffset CreatedAt);

// ── Order detail DTO ──────────────────────────────────────────────────────────

public sealed record OrderDetailDto(
    Guid Id,
    string OrderCode,
    Guid? UserId,
    string RecipientName,
    string RecipientPhone,
    string? Province,
    string? District,
    string? Ward,
    string AddressDetail,
    decimal SubTotal,
    decimal ShippingFee,
    decimal DiscountAmount,
    decimal TotalAmount,
    int Status,
    string StatusLabel,
    int PaymentStatus,
    string PaymentStatusLabel,
    int PaymentMethod,
    string PaymentMethodLabel,
    string? CouponCode,
    string? ShippingProvider,
    string? TrackingNumber,
    DateTimeOffset? ShippedAt,
    DateTimeOffset? DeliveredAt,
    string? CustomerNote,
    string? InternalNote,
    string? CancelReason,
    DateTimeOffset CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    IReadOnlyList<PaymentDto> Payments,
    IReadOnlyList<OrderStatusHistoryDto> StatusHistories);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class UpdateOrderStatusRequest
{
    public int NewStatus { get; set; }
    public string? Note { get; set; }
    public Guid? ChangedById { get; set; }
}

public sealed class UpdateOrderNoteRequest
{
    public string? InternalNote { get; set; }
    public string? TrackingNumber { get; set; }
    public string? ShippingProvider { get; set; }
}
