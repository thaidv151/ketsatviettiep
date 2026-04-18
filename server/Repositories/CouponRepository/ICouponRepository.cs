using Model.Entities;
using Repositories.Common;

namespace Repositories.CouponRepository;

public interface ICouponRepository : IRepositoryBase<Coupon>
{
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken ct = default);
}
