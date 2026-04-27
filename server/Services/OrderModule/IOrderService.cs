namespace Services.OrderModule;

public interface IOrderService
{
    Task<IReadOnlyList<OrderListDto>> GetListAsync(CancellationToken ct = default);
    Task<OrderDetailDto?> GetDetailAsync(Guid id, CancellationToken ct = default);
    Task<OrderDetailDto?> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest request, CancellationToken ct = default);
    Task<OrderDetailDto?> UpdateNoteAsync(Guid id, UpdateOrderNoteRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default);

    /// <summary>Danh sách đơn của user — portal.</summary>
    Task<IReadOnlyList<OrderListDto>> GetListForUserAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Tạo đơn từ portal, gán UserId.</summary>
    Task<CreatePortalOrderResult> CreatePortalOrderAsync(Guid userId, CreatePortalOrderRequest request, CancellationToken ct = default);
}
