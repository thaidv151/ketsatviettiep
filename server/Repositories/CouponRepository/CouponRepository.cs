using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.CouponRepository;

public sealed class CouponRepository : RepositoryBase<Coupon>, ICouponRepository
{
    public CouponRepository(AppDbContext db) : base(db) { }

    public async Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await Db.Coupons.AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == code, ct);
}
