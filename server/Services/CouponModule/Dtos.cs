namespace Services.CouponModule;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record CouponDto(
    Guid Id,
    string Code,
    string? Description,
    int DiscountType,
    string DiscountTypeLabel,
    decimal DiscountValue,
    decimal? MinOrderAmount,
    decimal? MaxDiscountAmount,
    int? UsageLimit,
    int UsedCount,
    int? PerUserLimit,
    DateTimeOffset? StartAt,
    DateTimeOffset? ExpiredAt,
    bool IsActive,
    DateTimeOffset CreatedAt);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class CreateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerUserLimit { get; set; }
    public DateTimeOffset? StartAt { get; set; }
    public DateTimeOffset? ExpiredAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DiscountType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal? MinOrderAmount { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? UsageLimit { get; set; }
    public int? PerUserLimit { get; set; }
    public DateTimeOffset? StartAt { get; set; }
    public DateTimeOffset? ExpiredAt { get; set; }
    public bool IsActive { get; set; }
}
