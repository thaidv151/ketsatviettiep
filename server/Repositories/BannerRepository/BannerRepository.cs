using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.BannerRepository;

public sealed class BannerRepository : RepositoryBase<Banner>, IBannerRepository
{
    public BannerRepository(AppDbContext db) : base(db) { }
}
