using System.Text.Json.Serialization;
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
    IReadOnlyList<string> GalleryImageUrls,
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
    [JsonPropertyName("sku")]
    public string Sku { get; set; } = string.Empty;
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("price")]
    public decimal Price { get; set; }
    [JsonPropertyName("originalPrice")]
    public decimal? OriginalPrice { get; set; }
    [JsonPropertyName("stockQuantity")]
    public int StockQuantity { get; set; }
    [JsonPropertyName("lowStockThreshold")]
    public int LowStockThreshold { get; set; } = 5;
    [JsonPropertyName("weightGram")]
    public int? WeightGram { get; set; }
    [JsonPropertyName("imageUrl")]
    public string? ImageUrl { get; set; }
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; } = true;
    [JsonPropertyName("attributeValueIds")]
    public List<Guid> AttributeValueIds { get; set; } = new();
    [JsonPropertyName("galleryImageUrls")]
    public List<string> GalleryImageUrls { get; set; } = new();
}

public sealed class CreateProductAttributeValueRequest
{
    [JsonPropertyName("value")]
    public string Text { get; set; } = string.Empty;
    [JsonPropertyName("colorHex")]
    public string? ColorHex { get; set; }
    [JsonPropertyName("sortOrder")]
    public int SortOrder { get; set; }
}

public sealed class CreateProductAttributeRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("isVariantOption")]
    public bool IsVariantOption { get; set; } = true;
    [JsonPropertyName("sortOrder")]
    public int SortOrder { get; set; }
    [JsonPropertyName("values")]
    public List<CreateProductAttributeValueRequest> Values { get; set; } = new();
}

public sealed class CreateProductRequest
{
    [JsonPropertyName("categoryId")]
    public Guid CategoryId { get; set; }
    [JsonPropertyName("brandId")]
    public Guid? BrandId { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;
    [JsonPropertyName("sku")]
    public string? Sku { get; set; }
    [JsonPropertyName("shortDescription")]
    public string? ShortDescription { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    [JsonPropertyName("basePrice")]
    public decimal? BasePrice { get; set; }
    [JsonPropertyName("salePrice")]
    public decimal? SalePrice { get; set; }
    [JsonPropertyName("thumbnailUrl")]
    public string? ThumbnailUrl { get; set; }
    [JsonPropertyName("status")]
    public int Status { get; set; } = 0;
    [JsonPropertyName("isFeatured")]
    public bool IsFeatured { get; set; }
    [JsonPropertyName("metaTitle")]
    public string? MetaTitle { get; set; }
    [JsonPropertyName("metaDescription")]
    public string? MetaDescription { get; set; }
    [JsonPropertyName("metaKeywords")]
    public string? MetaKeywords { get; set; }
    [JsonPropertyName("specifications")]
    public string? Specifications { get; set; }
    [JsonPropertyName("attributes")]
    public List<CreateProductAttributeRequest> Attributes { get; set; } = new();
    [JsonPropertyName("variants")]
    public List<CreateProductVariantRequest> Variants { get; set; } = new();
    [JsonPropertyName("imageUrls")]
    public List<string> ImageUrls { get; set; } = new();
}

public sealed class UpdateProductRequest
{
    [JsonPropertyName("categoryId")]
    public Guid CategoryId { get; set; }
    [JsonPropertyName("brandId")]
    public Guid? BrandId { get; set; }
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;
    [JsonPropertyName("sku")]
    public string? Sku { get; set; }
    [JsonPropertyName("shortDescription")]
    public string? ShortDescription { get; set; }
    [JsonPropertyName("description")]
    public string? Description { get; set; }
    [JsonPropertyName("basePrice")]
    public decimal? BasePrice { get; set; }
    [JsonPropertyName("salePrice")]
    public decimal? SalePrice { get; set; }
    [JsonPropertyName("thumbnailUrl")]
    public string? ThumbnailUrl { get; set; }
    [JsonPropertyName("status")]
    public int Status { get; set; }
    [JsonPropertyName("isFeatured")]
    public bool IsFeatured { get; set; }
    [JsonPropertyName("metaTitle")]
    public string? MetaTitle { get; set; }
    [JsonPropertyName("metaDescription")]
    public string? MetaDescription { get; set; }
    [JsonPropertyName("metaKeywords")]
    public string? MetaKeywords { get; set; }
    [JsonPropertyName("specifications")]
    public string? Specifications { get; set; }
    [JsonPropertyName("attributes")]
    public List<CreateProductAttributeRequest> Attributes { get; set; } = new();
    [JsonPropertyName("variants")]
    public List<CreateProductVariantRequest> Variants { get; set; } = new();
    [JsonPropertyName("imageUrls")]
    public List<string> ImageUrls { get; set; } = new();
}
