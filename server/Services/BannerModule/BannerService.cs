using Model.Entities;
using Repositories.BannerRepository;

namespace Services.BannerModule;

public sealed class BannerService : IBannerService
{
    private readonly IBannerRepository _repo;

    public BannerService(IBannerRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<BannerDto>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(ct);
        // Trả về danh sách đã sắp xếp theo SortOrder tăng dần, sau đó theo CreatedAt mới nhất
        return list.OrderBy(x => x.SortOrder).ThenByDescending(x => x.CreatedAt).Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<BannerDto>> GetActiveForPortalAsync(CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(ct);
        var now = DateTimeOffset.UtcNow;
        return list
            .Where(b => b.IsActive)
            .Where(b => b.StartDate is null || b.StartDate <= now)
            .Where(b => b.EndDate is null || b.EndDate >= now)
            .OrderBy(b => b.SortOrder)
            .ThenByDescending(b => b.CreatedAt)
            .Select(ToDto)
            .ToList();
    }

    public async Task<BannerDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<BannerDto> CreateAsync(CreateBannerRequest request, CancellationToken ct = default)
    {
        var entity = new Banner
        {
            Title       = request.Title,
            ImageUrl    = request.ImageUrl,
            LinkUrl     = request.LinkUrl,
            Description = request.Description,
            SortOrder   = request.SortOrder,
            IsActive    = request.IsActive,
            StartDate   = request.StartDate,
            EndDate     = request.EndDate,
        };
        var created = await _repo.CreateAsync(entity, ct);
        return ToDto(created);
    }

    public async Task<BannerDto?> UpdateAsync(Guid id, UpdateBannerRequest request, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity is null) return null;

        entity.Title       = request.Title;
        entity.ImageUrl    = request.ImageUrl;
        entity.LinkUrl     = request.LinkUrl;
        entity.Description = request.Description;
        entity.SortOrder   = request.SortOrder;
        entity.IsActive    = request.IsActive;
        entity.StartDate   = request.StartDate;
        entity.EndDate     = request.EndDate;

        await _repo.UpdateAsync(entity, ct);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken ct = default)
        => _repo.DeleteAsync(id, deletedById, ct);

    // ── Mapping ───────────────────────────────────────────────────────────────
    private static BannerDto ToDto(Banner b) => new(
        b.Id, b.Title, b.ImageUrl, b.LinkUrl, b.Description,
        b.SortOrder, b.IsActive, b.StartDate, b.EndDate, b.CreatedAt);
}
