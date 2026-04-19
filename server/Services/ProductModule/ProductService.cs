using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.ProductRepository;

namespace Services.ProductModule;

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly AppDbContext _db;

    public ProductService(IProductRepository repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<IReadOnlyList<ProductListDto>> GetListAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetListAsync(ct);
        return list.Select(p => new ProductListDto(
            p.Id, p.Name, p.Slug,
            p.Category?.Name, p.Brand?.Name, p.ThumbnailUrl,
            p.BasePrice, p.SalePrice,
            0,
            (int)p.Status, StatusLabel(p.Status),
            p.IsFeatured, p.CreatedAt)).ToList();
    }

    public async Task<ProductDetailDto?> GetDetailAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _repo.GetDetailAsync(id, ct);
        return p is null ? null : ToDetailDto(p);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequest req, CancellationToken ct = default)
    {
        var product = new Product
        {
            CategoryId = req.CategoryId,
            BrandId = req.BrandId,
            Name = req.Name,
            Slug = req.Slug,
            Sku = req.Sku,
            ShortDescription = req.ShortDescription,
            Description = req.Description,
            BasePrice = req.BasePrice,
            SalePrice = req.SalePrice,
            ThumbnailUrl = req.ThumbnailUrl,
            Status = (ProductStatus)req.Status,
            IsFeatured = req.IsFeatured,
            MetaTitle = req.MetaTitle,
            MetaDescription = req.MetaDescription,
            MetaKeywords = req.MetaKeywords,
            Specifications = req.Specifications,
        };
        product.Id = Guid.NewGuid();
        product.CreatedAt = DateTimeOffset.UtcNow;

        // Attributes + Values
        var attrEntities = req.Attributes.Select(a =>
        {
            var attr = new ProductAttribute
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                ProductId = product.Id,
                Name = a.Name, IsVariantOption = a.IsVariantOption, SortOrder = a.SortOrder,
            };
            var vals = a.Values.Select(v => new ProductAttributeValue
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                Value = v.Value, ColorHex = v.ColorHex, SortOrder = v.SortOrder,
                AttributeId = attr.Id
            }).ToList();
            _db.ProductAttributeValues.AddRange(vals);
            return attr;
        }).ToList();

        // Attributes + Values lookup removed

        // Variants
        var variantEntities = req.Variants.Select(v =>
        {
            var variant = new ProductVariant
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                ProductId = product.Id,
                Sku = v.Sku, Name = v.Name,
                Price = v.Price, OriginalPrice = v.OriginalPrice,
                StockQuantity = v.StockQuantity,
                LowStockThreshold = v.LowStockThreshold,
                WeightGram = v.WeightGram, ImageUrl = v.ImageUrl,
                IsActive = v.IsActive,
            };
            return variant;
        }).ToList();

        // Images
        var imgEntities = req.ImageUrls.Select((url, i) => new ProductImage
        {
            Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
            ProductId = product.Id,
            ImageUrl = url, SortOrder = i, IsPrimary = i == 0,
        }).ToList();

        await _db.Products.AddAsync(product, ct);
        await _db.ProductAttributes.AddRangeAsync(attrEntities, ct);
        await _db.ProductVariants.AddRangeAsync(variantEntities, ct);
        await _db.ProductImages.AddRangeAsync(imgEntities, ct);
        await _db.SaveChangesAsync(ct);

        var detail = await _repo.GetDetailAsync(product.Id, ct);
        return ToDetailDto(detail!);
    }

    public async Task<ProductDetailDto?> UpdateAsync(Guid id, UpdateProductRequest req, CancellationToken ct = default)
    {
        var entity = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null) return null;

        entity.CategoryId = req.CategoryId;
        entity.BrandId = req.BrandId;
        entity.Name = req.Name;
        entity.Slug = req.Slug;
        entity.Sku = req.Sku;
        entity.ShortDescription = req.ShortDescription;
        entity.Description = req.Description;
        entity.BasePrice = req.BasePrice;
        entity.SalePrice = req.SalePrice;
        entity.ThumbnailUrl = req.ThumbnailUrl;
        entity.Status = (ProductStatus)req.Status;
        entity.IsFeatured = req.IsFeatured;
        entity.MetaTitle = req.MetaTitle;
        entity.MetaDescription = req.MetaDescription;
        entity.MetaKeywords = req.MetaKeywords;
        entity.Specifications = req.Specifications;
        entity.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        var detail = await _repo.GetDetailAsync(id, ct);
        return ToDetailDto(detail!);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string StatusLabel(ProductStatus s) => s switch
    {
        ProductStatus.Draft => "Nháp",
        ProductStatus.Active => "Đang bán",
        ProductStatus.OutOfStock => "Hết hàng",
        ProductStatus.Discontinued => "Ngừng kinh doanh",
        _ => s.ToString()
    };

    private static ProductDetailDto ToDetailDto(Product p) => new(
        p.Id,
        p.CategoryId, p.Category?.Name,
        p.BrandId, p.Brand?.Name,
        p.Name, p.Slug, p.Sku,
        p.ShortDescription, p.Description,
        p.BasePrice, p.SalePrice, p.ThumbnailUrl,
        (int)p.Status, StatusLabel(p.Status),
        p.IsFeatured, p.ViewCount,
        p.MetaTitle, p.MetaDescription, p.MetaKeywords,
        p.Specifications,
        p.CreatedAt,
        new List<ProductImageDto>(),
        new List<ProductAttributeDto>(),
        new List<ProductVariantDto>()
    );
}
