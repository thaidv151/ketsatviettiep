using Model.Entities;
using Repositories.CouponRepository;

namespace Services.CouponModule;

public sealed class CouponService : ICouponService
{
    private readonly ICouponRepository _repo;

    public CouponService(ICouponRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(ct);
        return list.Select(ToDto).ToList();
    }

    public async Task<CouponDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default)
    {
        var entity = new Coupon
        {
            Code = request.Code.Trim().ToUpperInvariant(),
            Description = request.Description,
            DiscountType = (DiscountType)request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinOrderAmount = request.MinOrderAmount,
            MaxDiscountAmount = request.MaxDiscountAmount,
            UsageLimit = request.UsageLimit,
            PerUserLimit = request.PerUserLimit,
            StartAt = request.StartAt,
            ExpiredAt = request.ExpiredAt,
            IsActive = request.IsActive,
        };
        var created = await _repo.CreateAsync(entity, ct);
        return ToDto(created);
    }

    public async Task<CouponDto?> UpdateAsync(Guid id, UpdateCouponRequest request, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;
        entity.Code = request.Code.Trim().ToUpperInvariant();
        entity.Description = request.Description;
        entity.DiscountType = (DiscountType)request.DiscountType;
        entity.DiscountValue = request.DiscountValue;
        entity.MinOrderAmount = request.MinOrderAmount;
        entity.MaxDiscountAmount = request.MaxDiscountAmount;
        entity.UsageLimit = request.UsageLimit;
        entity.PerUserLimit = request.PerUserLimit;
        entity.StartAt = request.StartAt;
        entity.ExpiredAt = request.ExpiredAt;
        entity.IsActive = request.IsActive;
        await _repo.UpdateAsync(entity, ct);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    private static string DiscountTypeLabel(DiscountType t) => t switch
    {
        DiscountType.Percentage => "Giảm %",
        DiscountType.FixedAmount => "Giảm tiền",
        DiscountType.FreeShipping => "Miễn ship",
        _ => t.ToString()
    };

    private static CouponDto ToDto(Coupon c) => new(
        c.Id, c.Code, c.Description,
        (int)c.DiscountType, DiscountTypeLabel(c.DiscountType),
        c.DiscountValue, c.MinOrderAmount, c.MaxDiscountAmount,
        c.UsageLimit, c.UsedCount, c.PerUserLimit,
        c.StartAt, c.ExpiredAt, c.IsActive, c.CreatedAt);
}
