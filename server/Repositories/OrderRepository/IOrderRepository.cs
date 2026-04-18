using Model.Entities;
using Repositories.Common;

namespace Repositories.OrderRepository;

public interface IOrderRepository : IRepositoryBase<Order>
{
    /// <summary>Lấy đơn hàng đầy đủ: Items, Payments, StatusHistories.</summary>
    Task<Order?> GetDetailAsync(Guid id, CancellationToken ct = default);

    /// <summary>Danh sách đơn hàng cho bảng admin (kèm Items count).</summary>
    Task<IReadOnlyList<Order>> GetListAsync(CancellationToken ct = default);
}
