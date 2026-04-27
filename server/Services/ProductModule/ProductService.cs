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
        if (list.Count == 0)
            return new List<ProductListDto>();

        var productIds = list.Select(p => p.Id).ToList();
        var stockByProduct = await _db.ProductVariants.AsNoTracking()
            .Where(v => productIds.Contains(v.ProductId))
            .GroupBy(v => v.ProductId)
            .Select(g => new { g.Key, Total = g.Sum(v => v.StockQuantity) })
            .ToDictionaryAsync(x => x.Key, x => x.Total, ct);

        return list.Select(p => new ProductListDto(
            p.Id, p.Name, p.Slug,
            p.Category?.Name, p.Brand?.Name, p.ThumbnailUrl,
            p.BasePrice, p.SalePrice,
            stockByProduct.GetValueOrDefault(p.Id, 0),
            (int)p.Status, StatusLabel(p.Status),
            p.IsFeatured, p.CreatedAt)).ToList();
    }

    public async Task<ProductDetailDto?> GetDetailAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _db.Products.AsNoTracking()
            .Include(x => x.Category)
            .Include(x => x.Brand)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return null;

        // Chỉ thư viện chung sản phẩm; ảnh theo biến thể nằm trên từng ProductVariant (gallery).
        var images = await _db.ProductImages.AsNoTracking()
            .Where(i => i.ProductId == id && i.VariantId == null)
            .OrderBy(i => i.SortOrder)
            .Select(i => new ProductImageDto(i.Id, i.ImageUrl, i.AltText, i.IsPrimary, i.SortOrder))
            .ToListAsync(ct);

        var attrList = await _db.ProductAttributes.AsNoTracking()
            .Where(a => a.ProductId == id)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(ct);
        var attrIds = attrList.Select(a => a.Id).ToList();
        var allAttrValues = await _db.ProductAttributeValues.AsNoTracking()
            .Where(v => attrIds.Contains(v.AttributeId))
            .OrderBy(v => v.SortOrder)
            .ToListAsync(ct);
        var valuesByAttr = allAttrValues
            .GroupBy(v => v.AttributeId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var attrDtos = attrList.Select(a => new ProductAttributeDto(
            a.Id,
            a.Name,
            a.IsVariantOption,
            a.SortOrder,
            (valuesByAttr.TryGetValue(a.Id, out var vl) ? vl : new List<ProductAttributeValue>())
                .Select(v => new ProductAttributeValueDto(v.Id, v.Value, v.ColorHex, v.SortOrder))
                .ToList()
        )).ToList();

        var variants = await _db.ProductVariants.AsNoTracking()
            .Where(v => v.ProductId == id)
            .OrderBy(v => v.Sku)
            .ToListAsync(ct);
        var vIds = variants.Select(v => v.Id).ToList();
        var vLinks = vIds.Count == 0
            ? new List<ProductVariantAttributeValue>()
            : await _db.ProductVariantAttributeValues.AsNoTracking()
                .Where(x => vIds.Contains(x.VariantId))
                .ToListAsync(ct);
        var valIdsByV = vLinks
            .GroupBy(x => x.VariantId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<Guid>)g.Select(x => x.AttributeValueId).ToList());

        List<ProductImage> vGalleryRows;
        if (vIds.Count == 0)
            vGalleryRows = [];
        else
            vGalleryRows = await _db.ProductImages.AsNoTracking()
                .Where(i => i.ProductId == id && i.VariantId != null && vIds.Contains(i.VariantId!.Value))
                .OrderBy(i => i.VariantId)
                .ThenBy(i => i.SortOrder)
                .ToListAsync(ct);
        var galleryByVariant = vGalleryRows
            .GroupBy(i => i.VariantId!.Value)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<string>)g.Select(x => x.ImageUrl).ToList());

        var varDtos = variants.Select(v => new ProductVariantDto(
            v.Id,
            v.Sku,
            v.Name,
            v.Price,
            v.OriginalPrice,
            v.StockQuantity,
            v.LowStockThreshold,
            v.WeightGram,
            v.ImageUrl,
            galleryByVariant.TryGetValue(v.Id, out var gal) ? gal : Array.Empty<string>(),
            v.IsActive,
            valIdsByV.TryGetValue(v.Id, out var list) ? list : Array.Empty<Guid>()
        )).ToList();

        return new ProductDetailDto(
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
            images,
            attrDtos,
            varDtos
        );
    }

    public async Task<ProductDetailDto?> GetDetailBySlugAsync(string slug, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(slug)) return null;
        var key = slug.Trim();
        var id = await _db.Products.AsNoTracking()
            .Where(p => p.Slug == key)
            .Select(p => p.Id)
            .FirstOrDefaultAsync(ct);
        if (id == default) return null;
        return await GetDetailAsync(id, ct);
    }

    public async Task<ProductDetailDto> CreateAsync(CreateProductRequest req, CancellationToken ct = default)
    {
        var attrReqs = req.Attributes ?? new List<CreateProductAttributeRequest>();
        var varReqs = req.Variants ?? new List<CreateProductVariantRequest>();
        var imageUrls = req.ImageUrls ?? new List<string>();

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

        await _db.Products.AddAsync(product, ct);
        AddChildEntityGraph(product.Id, attrReqs, varReqs, imageUrls);
        await _db.SaveChangesAsync(ct);

        return (await GetDetailAsync(product.Id, ct))!;
    }

    public async Task<ProductDetailDto?> UpdateAsync(Guid id, UpdateProductRequest req, CancellationToken ct = default)
    {
        var attrReqs = req.Attributes ?? new List<CreateProductAttributeRequest>();
        var varReqs = req.Variants ?? new List<CreateProductVariantRequest>();
        var imageUrls = req.ImageUrls ?? new List<string>();
        var strategy = _db.Database.CreateExecutionStrategy();
        var found = false;

        await strategy.ExecuteAsync(async () =>
        {
            await using var tr = await _db.Database.BeginTransactionAsync(ct);
            try
            {
                var entity = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
                if (entity is null)
                {
                    await tr.RollbackAsync(ct);
                    return;
                }

                found = true;
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

                // Nếu biến thể đã phát sinh trong đơn hàng, không được xóa/rebuild biến thể
                // (FK OrderItems -> ProductVariants). Khi đó chỉ cập nhật thông tin chung sản phẩm.
                var hasReferencedVariants = await _db.OrderItems.AsNoTracking()
                    .AnyAsync(oi => oi.ProductId == id && oi.VariantId != null, ct);

                if (!hasReferencedVariants)
                {
                    await RemoveProductChildEntitiesAsync(id, ct);
                    AddChildEntityGraph(id, attrReqs, varReqs, imageUrls);
                    await _db.SaveChangesAsync(ct);
                }

                await tr.CommitAsync(ct);
            }
            catch
            {
                await tr.RollbackAsync(ct);
                throw;
            }
        });

        if (!found) return null;

        return await GetDetailAsync(id, ct);
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

    private void AddChildEntityGraph(
        Guid productId,
        IReadOnlyList<CreateProductAttributeRequest> attrReqs,
        IReadOnlyList<CreateProductVariantRequest> varReqs,
        IReadOnlyList<string> imageUrls)
    {
        foreach (var a in attrReqs)
        {
            var attr = new ProductAttribute
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                ProductId = productId,
                Name = a.Name,
                IsVariantOption = a.IsVariantOption,
                SortOrder = a.SortOrder,
            };
            _db.ProductAttributes.Add(attr);

            foreach (var vr in a.Values ?? new List<CreateProductAttributeValueRequest>())
            {
                var text = (vr.Text ?? string.Empty).Trim();
                if (string.IsNullOrEmpty(text)) continue;

                _db.ProductAttributeValues.Add(new ProductAttributeValue
                {
                    Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                    AttributeId = attr.Id,
                    Value = text,
                    ColorHex = string.IsNullOrWhiteSpace(vr.ColorHex) ? null : vr.ColorHex,
                    SortOrder = vr.SortOrder,
                });
            }
        }

        var variantEntities = varReqs.Select(v =>
        {
            var variant = new ProductVariant
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                ProductId = productId,
                Sku = v.Sku, Name = v.Name,
                Price = v.Price, OriginalPrice = v.OriginalPrice,
                StockQuantity = v.StockQuantity,
                LowStockThreshold = v.LowStockThreshold > 0 ? v.LowStockThreshold : 5,
                WeightGram = v.WeightGram, ImageUrl = v.ImageUrl,
                IsActive = v.IsActive,
            };
            return variant;
        }).ToList();

        var imgEntities = imageUrls
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Select((url, i) => new ProductImage
            {
                Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                ProductId = productId,
                VariantId = null,
                ImageUrl = url.Trim(), SortOrder = i, IsPrimary = i == 0,
            })
            .ToList();

        _db.ProductVariants.AddRange(variantEntities);
        for (var i = 0; i < variantEntities.Count; i++)
        {
            var varEnt = variantEntities[i];
            var vr = varReqs[i];
            var extra = (vr.GalleryImageUrls ?? new List<string>())
                .Where(u => !string.IsNullOrWhiteSpace(u))
                .Select(u => u.Trim())
                .ToList();
            for (var j = 0; j < extra.Count; j++)
            {
                _db.ProductImages.Add(new ProductImage
                {
                    Id = Guid.NewGuid(), CreatedAt = DateTimeOffset.UtcNow,
                    ProductId = productId,
                    VariantId = varEnt.Id,
                    ImageUrl = extra[j], SortOrder = j, IsPrimary = false, AltText = null,
                });
            }
        }

        _db.ProductImages.AddRange(imgEntities);
    }

    private async Task RemoveProductChildEntitiesAsync(Guid productId, CancellationToken ct)
    {
        var variantIds = await _db.ProductVariants
            .Where(x => x.ProductId == productId)
            .Select(x => x.Id)
            .ToListAsync(ct);
        if (variantIds.Count > 0)
        {
            await _db.ProductVariantAttributeValues
                .Where(x => variantIds.Contains(x.VariantId))
                .ExecuteDeleteAsync(ct);
        }

        await _db.ProductImages
            .Where(x => x.ProductId == productId)
            .ExecuteDeleteAsync(ct);

        if (variantIds.Count > 0)
        {
            await _db.ProductVariants
                .Where(x => x.ProductId == productId)
                .ExecuteDeleteAsync(ct);
        }

        var attrIds = await _db.ProductAttributes
            .Where(x => x.ProductId == productId)
            .Select(x => x.Id)
            .ToListAsync(ct);
        if (attrIds.Count > 0)
        {
            await _db.ProductAttributeValues
                .Where(x => attrIds.Contains(x.AttributeId))
                .ExecuteDeleteAsync(ct);
            await _db.ProductAttributes
                .Where(x => x.ProductId == productId)
                .ExecuteDeleteAsync(ct);
        }
    }
}
