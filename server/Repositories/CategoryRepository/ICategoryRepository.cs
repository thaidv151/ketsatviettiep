using Model.Entities;
using Repositories.Common;

namespace Repositories.CategoryRepository;

public interface ICategoryRepository : IRepositoryBase<Category>
{
    Task<IReadOnlyList<Category>> GetRootCategoriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Category>> GetByParentIdAsync(Guid parentId, CancellationToken ct = default);
}
