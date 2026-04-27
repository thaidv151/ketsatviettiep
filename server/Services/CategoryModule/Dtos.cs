using Services.Common;

namespace Services.CategoryModule;

// ── Tìm kiếm & phân trang ───────────────────────────────────────────────────

public class CategorySearch : SearchBase
{
    /// <summary>Tìm theo tên, slug, mô tả (contains).</summary>
    public string? Query { get; set; }

    public Guid? ParentId { get; set; }

    public bool? IsActive { get; set; }

    /// <summary>Chỉ danh mục gốc (cha null).</summary>
    public bool? RootOnly { get; set; }
}

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
