using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.ModuleRepository;

public sealed class ModuleRepository : RepositoryBase<Module>, IModuleRepository
{
    public ModuleRepository(AppDbContext db)
        : base(db)
    {
    }
}
