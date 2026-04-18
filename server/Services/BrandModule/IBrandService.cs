namespace Services.BrandModule;

public interface IBrandService
{
    Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken ct = default);
    Task<BrandDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<BrandDto> CreateAsync(CreateBrandRequest request, CancellationToken ct = default);
    Task<BrandDto?> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default);
}
