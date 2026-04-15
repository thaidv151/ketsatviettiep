using Model.Entities;
using Repositories.Common;

namespace Services.Common;

public abstract class ServiceBase<TEntity> : IServiceBase<TEntity>
    where TEntity : EntityBase
{
    protected readonly IRepositoryBase<TEntity> Repository;

    protected ServiceBase(IRepositoryBase<TEntity> repository)
    {
        Repository = repository;
    }

    public virtual Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => Repository.GetByIdAsync(id, cancellationToken);

    public virtual Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
        => Repository.GetAllAsync(cancellationToken);

    public virtual Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
        => Repository.CreateAsync(entity, cancellationToken);

    public virtual Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
        => Repository.UpdateAsync(entity, cancellationToken);

    public virtual Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => Repository.DeleteAsync(id, deletedById, cancellationToken);
}
