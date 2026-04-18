using Model.Entities;

namespace Services.ProductModule;

// ── Variant / Attribute DTOs ──────────────────────────────────────────────────

public sealed record ProductAttributeValueDto(Guid Id, string Value, string? ColorHex, int SortOrder);

public sealed record ProductAttributeDto(
    Guid Id,
    string Name,
    bool IsVariantOption,
    int SortOrder,
    IReadOnlyList<ProductAttributeValueDto> Values);

public sealed record ProductVariantDto(
    Guid Id,
    string Sku,
    string? Name,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    int LowStockThreshold,
    int? WeightGram,
    string? ImageUrl,
    bool IsActive,
    IReadOnlyList<Guid> AttributeValueIds);

public sealed record ProductImageDto(Guid Id, string ImageUrl, string? AltText, bool IsPrimary, int SortOrder);

// ── Product list DTO (tối giản cho bảng) ─────────────────────────────────────

public sealed record ProductListDto(
    Guid Id,
    string Name,
    string Slug,
    string? CategoryName,
    string? BrandName,
    string? ThumbnailUrl,
    decimal? BasePrice,
    decimal? SalePrice,
    int TotalStock,
    int Status,
    string StatusLabel,
    bool IsFeatured,
    DateTimeOffset CreatedAt);

// ── Product detail DTO ────────────────────────────────────────────────────────

public sealed record ProductDetailDto(
    Guid Id,
    Guid CategoryId,
    string? CategoryName,
    Guid? BrandId,
    string? BrandName,
    string Name,
    string Slug,
    string? Sku,
    string? ShortDescription,
    string? Description,
    decimal? BasePrice,
    decimal? SalePrice,
    string? ThumbnailUrl,
    int Status,
    string StatusLabel,
    bool IsFeatured,
    long ViewCount,
    string? MetaTitle,
    string? MetaDescription,
    string? MetaKeywords,
    string? Specifications,
    DateTimeOffset CreatedAt,
    IReadOnlyList<ProductImageDto> Images,
    IReadOnlyList<ProductAttributeDto> Attributes,
    IReadOnlyList<ProductVariantDto> Variants);

// ── Requests ─────────────────────────────────────────────────────────────────

public sealed class CreateProductVariantRequest
{
    public string Sku { get; set; } = string.Empty;
    public string? Name { get; set; }
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int StockQuantity { get; set; }
    public int LowStockThreshold { get; set; } = 5;
    public int? WeightGram { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Guid> AttributeValueIds { get; set; } = new();
}

public sealed class CreateProductAttributeValueRequest
{
    public string Value { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public int SortOrder { get; set; }
}

public sealed class CreateProductAttributeRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsVariantOption { get; set; } = true;
    public int SortOrder { get; set; }
    public List<CreateProductAttributeValueRequest> Values { get; set; } = new();
}

public sealed class CreateProductRequest
{
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal? BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int Status { get; set; } = 0;
    public bool IsFeatured { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string? Specifications { get; set; }
    public List<CreateProductAttributeRequest> Attributes { get; set; } = new();
    public List<CreateProductVariantRequest> Variants { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
}

public sealed class UpdateProductRequest
{
    public Guid CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public decimal? BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int Status { get; set; }
    public bool IsFeatured { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? MetaKeywords { get; set; }
    public string? Specifications { get; set; }
}
