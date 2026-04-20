using Model.Entities;

namespace Services.Common;

public interface IServiceBase<TEntity, TDto, TCreateRequest, TUpdateRequest>
    where TEntity : EntityBase
{
    Task<IReadOnlyList<TDto>> GetAllAsync(CancellationToken ct = default);
    Task<TDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TDto> CreateAsync(TCreateRequest request, CancellationToken ct = default);
    Task<TDto?> UpdateAsync(Guid id, TUpdateRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, Guid? deletedById = null, CancellationToken ct = default);
}
