using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;

namespace Repositories.Common;

public class RepositoryBase<TEntity> : IRepositoryBase<TEntity>
    where TEntity : EntityBase
{
    protected readonly AppDbContext Db;

    public RepositoryBase(AppDbContext db)
    {
        Db = db;
    }

    public virtual async Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Db.Set<TEntity>().AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public virtual async Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await Db.Set<TEntity>().AsNoTracking().ToListAsync(cancellationToken);
        return list;
    }

    public virtual async Task<TEntity> CreateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        if (entity.Id == Guid.Empty)
            entity.Id = Guid.NewGuid();
        entity.CreatedAt = DateTimeOffset.UtcNow;
        await Db.Set<TEntity>().AddAsync(entity, cancellationToken);
        await Db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public virtual async Task UpdateAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        entity.UpdatedAt = DateTimeOffset.UtcNow;
        Db.Set<TEntity>().Update(entity);
        await Db.SaveChangesAsync(cancellationToken);
    }

    public virtual async Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
    {
        var entity = await Db.Set<TEntity>().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
        if (entity is null)
            throw new KeyNotFoundException($"Không tìm thấy {typeof(TEntity).Name} với Id = {id}");

        entity.IsDeleted = true;
        entity.DeletedAt = DateTimeOffset.UtcNow;
        entity.DeletedById = deletedById;
        await Db.SaveChangesAsync(cancellationToken);
    }

    public virtual IQueryable<TEntity> GetQueryable()
    {
        return Db.Set<TEntity>();
    }
}
