namespace Services.BannerModule;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record BannerDto(
    Guid Id,
    string Title,
    string ImageUrl,
    string? LinkUrl,
    string? Description,
    int SortOrder,
    bool IsActive,
    DateTimeOffset? StartDate,
    DateTimeOffset? EndDate,
    DateTimeOffset CreatedAt);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class CreateBannerRequest
{
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
}

public sealed class UpdateBannerRequest
{
    public string Title { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
}
