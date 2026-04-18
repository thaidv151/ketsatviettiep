namespace Services.CategoryModule;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record CategoryDto(
    Guid Id,
    Guid? ParentId,
    string? ParentName,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    int SortOrder,
    bool IsActive,
    int ChildCount,
    DateTimeOffset CreatedAt);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class CreateCategoryRequest
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateCategoryRequest
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
