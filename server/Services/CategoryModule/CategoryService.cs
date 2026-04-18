using Model.Entities;
using Repositories.CategoryRepository;

namespace Services.CategoryModule;

public sealed class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;

    public CategoryService(ICategoryRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = new Category
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
        };
        var created = await _repo.CreateAsync(entity, ct);
        return ToDto(created);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;
        entity.ParentId = request.ParentId;
        entity.Name = request.Name;
        entity.Slug = request.Slug;
        entity.Description = request.Description;
        entity.ImageUrl = request.ImageUrl;
        entity.SortOrder = request.SortOrder;
        entity.IsActive = request.IsActive;
        await _repo.UpdateAsync(entity, ct);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    private static CategoryDto ToDto(Category c) => new(
        c.Id,
        c.ParentId,
        c.Parent?.Name,
        c.Name,
        c.Slug,
        c.Description,
        c.ImageUrl,
        c.SortOrder,
        c.IsActive,
        c.Children?.Count ?? 0,
        c.CreatedAt);
}
