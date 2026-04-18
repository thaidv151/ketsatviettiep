namespace Services.CouponModule;

public interface ICouponService
{
    Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken ct = default);
    Task<CouponDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken ct = default);
    Task<CouponDto?> UpdateAsync(Guid id, UpdateCouponRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default);
}
