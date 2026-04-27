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
          o.Id, o.OrderCode, o.UserId,
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
        if (order is null) return null;
        var itemEntities = await _db.OrderItems.AsNoTracking()
            .Where(i => i.OrderId == id)
            .OrderBy(i => i.CreatedAt)
            .ToListAsync(ct);
        var itemDtos = (IReadOnlyList<OrderItemDto>)itemEntities.Select(i => new OrderItemDto(
            i.Id, i.ProductId, i.VariantId,
            i.ProductName, i.VariantName, i.Sku, i.ThumbnailUrl,
            i.UnitPrice, i.DiscountAmount, i.Quantity, i.SubTotal)).ToList();
        return ToDetailDto(order, itemDtos);
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

    public async Task<IReadOnlyList<OrderListDto>> GetListForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var orders = await _db.Orders.AsNoTracking()
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
        if (orders.Count == 0) return Array.Empty<OrderListDto>();

        var orderIds = orders.Select(o => o.Id).ToList();
        var counts = await _db.OrderItems.AsNoTracking()
            .Where(i => orderIds.Contains(i.OrderId))
            .GroupBy(i => i.OrderId)
            .Select(g => new { OrderId = g.Key, Cnt = g.Count() })
            .ToListAsync(ct);
        var countMap = counts.ToDictionary(x => x.OrderId, x => x.Cnt);

        return orders.Select(o => new OrderListDto(
            o.Id, o.OrderCode, o.UserId,
            o.RecipientName, o.RecipientPhone,
            o.TotalAmount,
            (int)o.Status, OrderStatusLabel(o.Status),
            (int)o.PaymentStatus, PaymentStatusLabel(o.PaymentStatus),
            (int)o.PaymentMethod, PaymentMethodLabel(o.PaymentMethod),
            countMap.GetValueOrDefault(o.Id, 0),
            o.CreatedAt)).ToList();
    }

    public async Task<CreatePortalOrderResult> CreatePortalOrderAsync(
        Guid userId,
        CreatePortalOrderRequest request,
        CancellationToken ct = default)
    {
        if (request.Items is null || request.Items.Count == 0)
            throw new InvalidOperationException("Giỏ hàng trống.");

        var now = DateTimeOffset.UtcNow;
        var orderId = Guid.NewGuid();
        var orderCode = await GenerateUniqueOrderCodeAsync(ct);
        var recipientName = $"{request.LastName} {request.FirstName}".Trim();
        if (string.IsNullOrWhiteSpace(recipientName))
            recipientName = "Khách hàng";
        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new InvalidOperationException("Số điện thoại bắt buộc.");

        var payMethod = ParsePaymentMethod(request.PaymentMethod);
        var noteParts = new List<string>();
        if (!string.IsNullOrWhiteSpace(request.Email))
            noteParts.Add($"Email: {request.Email}");
        if (!string.IsNullOrWhiteSpace(request.ZipCode))
            noteParts.Add($"Mã bưu chính: {request.ZipCode}");
        var customerNote = noteParts.Count > 0 ? string.Join(" | ", noteParts) : null;

        decimal orderSub = 0;
        var orderItems = new List<OrderItem>();

        foreach (var line in request.Items)
        {
            if (line.Quantity <= 0) throw new InvalidOperationException("Số lượng không hợp lệ.");
            if (line.Price < 0) throw new InvalidOperationException("Giá không hợp lệ.");

            var product = await _db.Products.AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == line.ProductId, ct);
            if (product is null) throw new InvalidOperationException("Sản phẩm không tồn tại hoặc đã gỡ.");

            string? variantName = null;
            string? sku = null;
            if (line.VariantId is { } vId)
            {
                var variant = await _db.ProductVariants
                    .FirstOrDefaultAsync(x => x.Id == vId && x.ProductId == line.ProductId, ct);
                if (variant is null) throw new InvalidOperationException("Biến thể sản phẩm không hợp lệ.");
                variantName = variant.Name;
                sku = variant.Sku;
            }

            var lineDiscount = 0m;
            var lineSub = (line.Price - lineDiscount) * line.Quantity;
            orderSub += lineSub;

            var oi = new OrderItem
            {
                Id = Guid.NewGuid(),
                CreatedAt = now,
                IsDeleted = false,
                OrderId = orderId,
                ProductId = line.ProductId,
                VariantId = line.VariantId,
                ProductName = product.Name,
                VariantName = variantName,
                Sku = sku,
                ThumbnailUrl = product.ThumbnailUrl,
                UnitPrice = line.Price,
                DiscountAmount = lineDiscount,
                Quantity = line.Quantity,
                SubTotal = lineSub,
            };
            orderItems.Add(oi);
        }

        var shipping = 0m;
        var discount = 0m;
        var total = orderSub + shipping - discount;

        var order = new Order
        {
            Id = orderId,
            CreatedAt = now,
            IsDeleted = false,
            OrderCode = orderCode,
            UserId = userId,
            RecipientName = recipientName,
            RecipientPhone = request.Phone.Trim(),
            Province = string.IsNullOrWhiteSpace(request.City) ? null : request.City.Trim(),
            District = null,
            Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim(),
            AddressDetail = request.Address.Trim(),
            SubTotal = orderSub,
            ShippingFee = shipping,
            DiscountAmount = discount,
            TotalAmount = total,
            Status = OrderStatus.Pending,
            PaymentStatus = PaymentStatus.Unpaid,
            PaymentMethod = payMethod,
            CustomerNote = customerNote,
        };

        await _db.Orders.AddAsync(order, ct);
        await _db.OrderItems.AddRangeAsync(orderItems, ct);
        await _db.SaveChangesAsync(ct);

        return new CreatePortalOrderResult(orderId, orderCode);
    }

    private async Task<string> GenerateUniqueOrderCodeAsync(CancellationToken ct)
    {
        for (var attempt = 0; attempt < 12; attempt++)
        {
            var suffix = Random.Shared.Next(1000, 9999);
            var code = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{suffix}";
            var exists = await _db.Orders.AnyAsync(o => o.OrderCode == code, ct);
            if (!exists) return code;
        }
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";
    }

    private static PaymentMethod ParsePaymentMethod(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return PaymentMethod.COD;
        var s = raw.Trim().ToLowerInvariant();
        if (s is "cod" or "tien-mat" or "tiền mặt") return PaymentMethod.COD;
        if (s is "chuyen-khoan" or "bank" or "banktransfer" or "chuyển khoản") return PaymentMethod.BankTransfer;
        return PaymentMethod.COD;
    }

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

    private static OrderDetailDto ToDetailDto(Order o, IReadOnlyList<OrderItemDto> items) => new(
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
        items,
        new List<PaymentDto>(),
        new List<OrderStatusHistoryDto>()
    );
}
