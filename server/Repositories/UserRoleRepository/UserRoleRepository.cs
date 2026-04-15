using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.UserRoleRepository;

public sealed class UserRoleRepository : RepositoryBase<UserRole>, IUserRoleRepository
{
    public UserRoleRepository(AppDbContext db)
        : base(db)
    {
    }
}
