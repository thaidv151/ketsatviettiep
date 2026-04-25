using Model.Entities;

namespace Repositories.Common;

public interface IRepositoryBase<TEntity>
    where TEntity : EntityBase
{
    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default);

    Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);

    IQueryable<TEntity> GetQueryable();
}
