namespace Services.BannerModule;

public interface IBannerService
{
    Task<IReadOnlyList<BannerDto>> GetAllAsync(CancellationToken ct = default);
    /// <summary>Banner đang bật và nằm trong khoảng ngày (nếu có) — dùng storefront.</summary>
    Task<IReadOnlyList<BannerDto>> GetActiveForPortalAsync(CancellationToken ct = default);
    Task<BannerDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<BannerDto> CreateAsync(CreateBannerRequest request, CancellationToken ct = default);
    Task<BannerDto?> UpdateAsync(Guid id, UpdateBannerRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default);
}
