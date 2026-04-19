using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.OrderRepository;

namespace Services.OrderModule;

public sealed class OrderService : IOrderService
{
    private readonly IOrderRepository _repo;
    private readonly AppDbContext _db;

    public OrderService(IOrderRepository repo, AppDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<IReadOnlyList<OrderListDto>> GetListAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetListAsync(ct);
        return list.Select(o => new OrderListDto(
            o.Id, o.OrderCode,
            o.RecipientName, o.RecipientPhone,
            o.TotalAmount,
            (int)o.Status, OrderStatusLabel(o.Status),
            (int)o.PaymentStatus, PaymentStatusLabel(o.PaymentStatus),
            (int)o.PaymentMethod, PaymentMethodLabel(o.PaymentMethod),
            0,
            o.CreatedAt)).ToList();
    }

    public async Task<OrderDetailDto?> GetDetailAsync(Guid id, CancellationToken ct = default)
    {
        var order = await _repo.GetDetailAsync(id, ct);
        return order is null ? null : ToDetailDto(order);
    }

    public async Task<OrderDetailDto?> UpdateStatusAsync(Guid id, UpdateOrderStatusRequest req, CancellationToken ct = default)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order is null) return null;

        var oldStatus = order.Status;
        var newStatus = (OrderStatus)req.NewStatus;

        // Ghi history
        var history = new OrderStatusHistory
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTimeOffset.UtcNow,
            OrderId = id,
            FromStatus = oldStatus,
            ToStatus = newStatus,
            Note = req.Note,
            ChangedById = req.ChangedById,
        };
        await _db.OrderStatusHistories.AddAsync(history, ct);

        order.Status = newStatus;
        order.UpdatedAt = DateTimeOffset.UtcNow;

        if (newStatus == OrderStatus.Shipped) order.ShippedAt = DateTimeOffset.UtcNow;
        if (newStatus == OrderStatus.Delivered) order.DeliveredAt = DateTimeOffset.UtcNow;
        if (newStatus == OrderStatus.Cancelled) order.CancelledAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return await GetDetailAsync(id, ct);
    }

    public async Task<OrderDetailDto?> UpdateNoteAsync(Guid id, UpdateOrderNoteRequest req, CancellationToken ct = default)
    {
        var order = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order is null) return null;
        order.InternalNote = req.InternalNote;
        order.TrackingNumber = req.TrackingNumber;
        order.ShippingProvider = req.ShippingProvider;
        order.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
        return await GetDetailAsync(id, ct);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    // ── Label helpers ─────────────────────────────────────────────────────────

    private static string OrderStatusLabel(OrderStatus s) => s switch
    {
        OrderStatus.Pending => "Chờ xác nhận",
        OrderStatus.Confirmed => "Đã xác nhận",
        OrderStatus.Processing => "Đang xử lý",
        OrderStatus.Shipped => "Đang giao",
        OrderStatus.Delivered => "Đã giao",
        OrderStatus.Cancelled => "Đã hủy",
        OrderStatus.ReturnRequested => "Yêu cầu hoàn",
        OrderStatus.Returned => "Đã hoàn hàng",
        OrderStatus.Refunded => "Đã hoàn tiền",
        _ => s.ToString()
    };

    private static string PaymentStatusLabel(PaymentStatus s) => s switch
    {
        PaymentStatus.Unpaid => "Chưa thanh toán",
        PaymentStatus.Paid => "Đã thanh toán",
        PaymentStatus.PartiallyPaid => "Thanh toán một phần",
        PaymentStatus.Refunded => "Đã hoàn tiền",
        PaymentStatus.Failed => "Thất bại",
        _ => s.ToString()
    };

    private static string PaymentMethodLabel(PaymentMethod m) => m switch
    {
        PaymentMethod.COD => "Tiền mặt (COD)",
        PaymentMethod.BankTransfer => "Chuyển khoản",
        PaymentMethod.VnPay => "VNPay",
        PaymentMethod.MoMo => "MoMo",
        PaymentMethod.ZaloPay => "ZaloPay",
        PaymentMethod.CreditCard => "Thẻ tín dụng",
        _ => m.ToString()
    };

    private static OrderDetailDto ToDetailDto(Order o) => new(
        o.Id, o.OrderCode, o.UserId,
        o.RecipientName, o.RecipientPhone,
        o.Province, o.District, o.Ward, o.AddressDetail,
        o.SubTotal, o.ShippingFee, o.DiscountAmount, o.TotalAmount,
        (int)o.Status, OrderStatusLabel(o.Status),
        (int)o.PaymentStatus, PaymentStatusLabel(o.PaymentStatus),
        (int)o.PaymentMethod, PaymentMethodLabel(o.PaymentMethod),
        o.CouponCode, o.ShippingProvider, o.TrackingNumber,
        o.ShippedAt, o.DeliveredAt,
        o.CustomerNote, o.InternalNote, o.CancelReason,
        o.CreatedAt,
        new List<OrderItemDto>(),
        new List<PaymentDto>(),
        new List<OrderStatusHistoryDto>()
    );
}
