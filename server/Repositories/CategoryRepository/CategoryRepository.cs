using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.CategoryRepository;

public sealed class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
{
    public CategoryRepository(AppDbContext db) : base(db) { }

    public async Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken ct = default)
        => await Db.Categories.AsNoTracking()
            .Where(c => c.ParentId == null)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Category>> GetByParentIdAsync(Guid parentId, CancellationToken ct = default)
        => await Db.Categories.AsNoTracking()
            .Where(c => c.ParentId == parentId)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);

    public override async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default)
        => await Db.Categories.AsNoTracking()
            .Include(c => c.Parent)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
            .ToListAsync(ct);
}
