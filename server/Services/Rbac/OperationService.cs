using Model.Entities;
using Repositories.ModuleRepository;
using Repositories.OperationRepository;

namespace Services.Rbac;

public sealed class OperationService : IOperationService
{
    private readonly IOperationRepository _operations;
    private readonly IModuleRepository _modules;

    public OperationService(IOperationRepository operations, IModuleRepository modules)
    {
        _operations = operations;
        _modules = modules;
    }

    public async Task<IReadOnlyList<OperationDto>> GetByModuleIdAsync(Guid moduleId, CancellationToken cancellationToken = default)
    {
        var ops = await _operations.GetByModuleIdAsync(moduleId, cancellationToken);
        var modules = await _modules.GetAllAsync(cancellationToken);
        var map = modules.ToDictionary(m => m.Id, m => m.Name);
        return ops.Select(o => ToDto(o, map.GetValueOrDefault(o.ModuleId))).ToList();
    }

    public async Task<OperationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _operations.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        var modules = await _modules.GetAllAsync(cancellationToken);
        var map = modules.ToDictionary(m => m.Id, m => m.Name);
        return ToDto(entity, map.GetValueOrDefault(entity.ModuleId));
    }

    public async Task<OperationDto> CreateAsync(CreateOperationRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Operation
        {
            ModuleId = request.ModuleId,
            Name = request.Name,
            Url = request.Url,
            Code = request.Code,
            Css = request.Css,
            IsShow = request.IsShow,
            SortOrder = request.SortOrder,
            Icon = request.Icon,
        };
        var created = await _operations.CreateAsync(entity, cancellationToken);
        var modules = await _modules.GetAllAsync(cancellationToken);
        var map = modules.ToDictionary(m => m.Id, m => m.Name);
        return ToDto(created, map.GetValueOrDefault(created.ModuleId));
    }

    public async Task<OperationDto?> UpdateAsync(Guid id, UpdateOperationRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _operations.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        entity.ModuleId = request.ModuleId;
        entity.Name = request.Name;
        entity.Url = request.Url;
        entity.Code = request.Code;
        entity.Css = request.Css;
        entity.IsShow = request.IsShow;
        entity.SortOrder = request.SortOrder;
        entity.Icon = request.Icon;
        await _operations.UpdateAsync(entity, cancellationToken);
        var modules = await _modules.GetAllAsync(cancellationToken);
        var map = modules.ToDictionary(m => m.Id, m => m.Name);
        return ToDto(entity, map.GetValueOrDefault(entity.ModuleId));
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => _operations.DeleteAsync(id, deletedById, cancellationToken);

    private static OperationDto ToDto(Operation o, string? moduleName) =>
        new(
            o.Id,
            o.ModuleId,
            moduleName,
            o.Name,
            o.Url,
            o.Code,
            o.Css,
            o.IsShow,
            o.SortOrder,
            o.Icon,
            o.CreatedAt);
}
