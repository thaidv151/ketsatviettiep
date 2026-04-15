using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.AppUserRepository;

public sealed class AppUserRepository : RepositoryBase<AppUser>, IAppUserRepository
{
    public AppUserRepository(AppDbContext db)
        : base(db)
    {
    }
}
