using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.OrderRepository;

public sealed class OrderRepository : RepositoryBase<Order>, IOrderRepository
{
    public OrderRepository(AppDbContext db) : base(db) { }

    public async Task<IReadOnlyList<Order>> GetListAsync(CancellationToken ct = default)
        => await Db.Orders.AsNoTracking()
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);

    public async Task<Order?> GetDetailAsync(Guid id, CancellationToken ct = default)
        => await Db.Orders.AsNoTracking()
            .Include(o => o.Coupon)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
}
