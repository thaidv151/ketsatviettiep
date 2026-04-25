using Repositories.Common;
using Model.Entities;
using Model.Persistence;

namespace Repositories.NhomDanhMucRepository;

public class NhomDanhMucRepository : RepositoryBase<NhomDanhMuc>, INhomDanhMucRepository
{
    public NhomDanhMucRepository(AppDbContext db) : base(db)
    {
    }
}
