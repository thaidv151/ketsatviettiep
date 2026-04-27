using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.Common;

namespace Services.Common;

public abstract class ServiceBase<TEntity, TDto, TCreateRequest, TUpdateRequest> 
    : IServiceBase<TEntity, TDto, TCreateRequest, TUpdateRequest>
    where TEntity : EntityBase
{
    protected readonly IRepositoryBase<TEntity> Repository;
    protected readonly IMapper Mapper;
    protected readonly ILogger Logger;

    protected ServiceBase(IRepositoryBase<TEntity> repository, IMapper mapper, ILogger logger)
    {
        Repository = repository;
        Mapper = mapper;
        Logger = logger;
    }

    public virtual async Task<IReadOnlyList<TDto>> GetAllAsync(CancellationToken ct = default)
    {
        try
        {
            var entities = await Repository.GetAllAsync(ct);
            // Map tới List<T> rồi trả IReadOnlyList: AutoMapper không map ổn định List<TEntity> -> IReadOnlyList<TDto>.
            return Mapper.Map<List<TDto>>(entities);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi lấy danh sách {EntityName}", typeof(TEntity).Name);
            throw;
        }
    }

    public virtual async Task<TDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var entity = await Repository.GetByIdAsync(id, ct);
            return entity == null ? default : Mapper.Map<TDto>(entity);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi lấy {EntityName} id: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }

    public virtual async Task<TDto> CreateAsync(TCreateRequest request, CancellationToken ct = default)
    {
        try
        {
            var entity = Mapper.Map<TEntity>(request);
            var createdEntity = await Repository.CreateAsync(entity, ct);
            return Mapper.Map<TDto>(createdEntity);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi tạo mới {EntityName}", typeof(TEntity).Name);
            throw;
        }
    }

    public virtual async Task<TDto?> UpdateAsync(Guid id, TUpdateRequest request, CancellationToken ct = default)
    {
        try
        {
            var entity = await Repository.GetByIdAsync(id, ct);
            if (entity == null) return default;

            Mapper.Map(request, entity);
            await Repository.UpdateAsync(entity, ct);
            return Mapper.Map<TDto>(entity);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi cập nhật {EntityName} id: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }

    public virtual async Task UpdateAsync(TEntity entity, CancellationToken ct = default)
    {
        try
        {
            await Repository.UpdateAsync(entity, ct);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi cập nhật thực thể {EntityName} id: {Id}", typeof(TEntity).Name, entity.Id);
            throw;
        }
    }

    public virtual async Task DeleteAsync(Guid id, Guid? deletedById = null, CancellationToken ct = default)
    {
        try
        {
            await Repository.DeleteAsync(id, deletedById, ct);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi xóa {EntityName} id: {Id}", typeof(TEntity).Name, id);
            throw;
        }
    }
}
