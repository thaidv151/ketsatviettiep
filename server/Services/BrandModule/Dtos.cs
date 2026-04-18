namespace Services.BrandModule;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record BrandDto(
    Guid Id,
    string Name,
    string? Slug,
    string? Description,
    string? LogoUrl,
    string? WebsiteUrl,
    bool IsActive,
    DateTimeOffset CreatedAt);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class CreateBrandRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateBrandRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public bool IsActive { get; set; }
}
