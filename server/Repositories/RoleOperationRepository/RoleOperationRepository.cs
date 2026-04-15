using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.RoleOperationRepository;

public sealed class RoleOperationRepository : RepositoryBase<RoleOperation>, IRoleOperationRepository
{
    public RoleOperationRepository(AppDbContext db)
        : base(db)
    {
    }
}
