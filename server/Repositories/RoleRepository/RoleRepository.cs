using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.RoleRepository;

public sealed class RoleRepository : RepositoryBase<Role>, IRoleRepository
{
    public RoleRepository(AppDbContext db)
        : base(db)
    {
    }
}
