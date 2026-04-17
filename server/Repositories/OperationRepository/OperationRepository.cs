using Model.Entities;
using Model.Persistence;
using Microsoft.EntityFrameworkCore;
using Repositories.Common;

namespace Repositories.OperationRepository;

public sealed class OperationRepository : RepositoryBase<Operation>, IOperationRepository
{
    public OperationRepository(AppDbContext db)
        : base(db)
    {
    }

    public async Task<IReadOnlyList<Operation>> GetByModuleIdAsync(Guid moduleId, CancellationToken cancellationToken = default)
    {
        var list = await Db.Set<Operation>()
            .AsNoTracking()
            .Where(o => o.ModuleId == moduleId)
            .OrderBy(o => o.SortOrder)
            .ThenBy(o => o.Name)
            .ToListAsync(cancellationToken);
        return list;
    }
}
