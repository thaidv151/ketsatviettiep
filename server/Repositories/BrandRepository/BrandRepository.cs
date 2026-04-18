using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.BrandRepository;

public sealed class BrandRepository : RepositoryBase<Brand>, IBrandRepository
{
    public BrandRepository(AppDbContext db) : base(db) { }
}
