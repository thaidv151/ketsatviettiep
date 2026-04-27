namespace Services.ProductModule;

public interface IProductService
{
    Task<IReadOnlyList<ProductListDto>> GetListAsync(CancellationToken ct = default);
    Task<ProductDetailDto?> GetDetailAsync(Guid id, CancellationToken ct = default);
    Task<ProductDetailDto?> GetDetailBySlugAsync(string slug, CancellationToken ct = default);
    Task<ProductDetailDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDetailDto?> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default);
}
