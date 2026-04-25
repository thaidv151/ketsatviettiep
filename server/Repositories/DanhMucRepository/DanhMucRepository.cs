using Repositories.Common;
using Model.Entities;
using Model.Persistence;

namespace Repositories.DanhMucRepository;

public class DanhMucRepository : RepositoryBase<DanhMuc>, IDanhMucRepository
{
    public DanhMucRepository(AppDbContext db) : base(db)
    {
    }
}
