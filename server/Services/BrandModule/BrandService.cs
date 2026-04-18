using Model.Entities;
using Repositories.BrandRepository;

namespace Services.BrandModule;

public sealed class BrandService : IBrandService
{
    private readonly IBrandRepository _repo;

    public BrandService(IBrandRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<BrandDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<BrandDto> CreateAsync(CreateBrandRequest request, CancellationToken ct = default)
    {
        var entity = new Brand
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            LogoUrl = request.LogoUrl,
            WebsiteUrl = request.WebsiteUrl,
            IsActive = request.IsActive,
        };
        var created = await _repo.CreateAsync(entity, ct);
        return ToDto(created);
    }

    public async Task<BrandDto?> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;
        entity.Name = request.Name;
        entity.Slug = request.Slug;
        entity.Description = request.Description;
        entity.LogoUrl = request.LogoUrl;
        entity.WebsiteUrl = request.WebsiteUrl;
        entity.IsActive = request.IsActive;
        await _repo.UpdateAsync(entity, ct);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    private static BrandDto ToDto(Brand b) => new(
        b.Id, b.Name, b.Slug, b.Description, b.LogoUrl, b.WebsiteUrl, b.IsActive, b.CreatedAt);
}
