using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.OperationRepository;

public sealed class OperationRepository : RepositoryBase<Operation>, IOperationRepository
{
    public OperationRepository(AppDbContext db)
        : base(db)
    {
    }
}
