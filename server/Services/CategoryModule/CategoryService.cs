using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.CategoryRepository;
using Services.Common;

namespace Services.CategoryModule;

public sealed class CategoryService
    : ServiceBase<Category, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>, ICategoryService
{
    public CategoryService(ICategoryRepository repo, IMapper mapper, ILogger<CategoryService> logger)
        : base(repo, mapper, logger)
    {
    }

    /// <summary>Project trực tiếp — tránh AutoMapper với record + đủ ParentName/ChildCount.</summary>
    public override async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        IQueryable<Category> all = Repository.GetQueryable().AsNoTracking();
        var projected = all
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Name)
            .Select(c => new CategoryDto(
                c.Id,
                c.ParentId,
                c.Parent != null ? c.Parent.Name : null,
                c.Name,
                c.Slug,
                c.Description,
                c.ImageUrl,
                c.SortOrder,
                c.IsActive,
                all.Count(x => x.ParentId == c.Id),
                c.CreatedAt));
        return await projected.ToListAsync(ct);
    }

    public override async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        IQueryable<Category> all = Repository.GetQueryable().AsNoTracking();
        return await all
            .Where(c => c.Id == id)
            .Select(c => new CategoryDto(
                c.Id,
                c.ParentId,
                c.Parent != null ? c.Parent.Name : null,
                c.Name,
                c.Slug,
                c.Description,
                c.ImageUrl,
                c.SortOrder,
                c.IsActive,
                all.Count(x => x.ParentId == c.Id),
                c.CreatedAt))
            .FirstOrDefaultAsync(ct);
    }

    public override async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = Mapper.Map<Category>(request);
        var created = await Repository.CreateAsync(entity, ct);
        var dto = await GetByIdAsync(created.Id, ct);
        return dto ?? throw new InvalidOperationException("Không đọc lại được danh mục vừa tạo.");
    }

    public override async Task<CategoryDto?> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var entity = await Repository.GetByIdAsync(id, ct);
        if (entity is null) return null;
        Mapper.Map(request, entity);
        await Repository.UpdateAsync(entity, ct);
        return await GetByIdAsync(id, ct);
    }

    public async Task<PagedList<CategoryDto>> GetDataAsync(CategorySearch search, CancellationToken ct = default)
    {
        IQueryable<Category> all = Repository.GetQueryable().AsNoTracking();
        IQueryable<Category> q = all;

        if (!string.IsNullOrWhiteSpace(search.Query))
        {
            var t = search.Query!.Trim();
            q = q.Where(c =>
                c.Name.Contains(t) || c.Slug.Contains(t) ||
                (c.Description != null && c.Description.Contains(t)));
        }

        if (search.ParentId.HasValue)
            q = q.Where(c => c.ParentId == search.ParentId);

        if (search.RootOnly == true)
            q = q.Where(c => c.ParentId == null);

        if (search.IsActive.HasValue)
            q = q.Where(c => c.IsActive == search.IsActive.Value);

        q = q.OrderBy(c => c.SortOrder).ThenBy(c => c.Name);

        var projected = q.Select(c => new CategoryDto(
            c.Id,
            c.ParentId,
            c.Parent != null ? c.Parent.Name : null,
            c.Name,
            c.Slug,
            c.Description,
            c.ImageUrl,
            c.SortOrder,
            c.IsActive,
            all.Count(x => x.ParentId == c.Id),
            c.CreatedAt));

        return await PagedList<CategoryDto>.CreateAsync(projected, search);
    }
}
