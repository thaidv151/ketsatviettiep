using Model.Entities;
using Repositories.ModuleRepository;

namespace Services.Rbac;

public sealed class ModuleService : IModuleService
{
    private readonly IModuleRepository _repository;

    public ModuleService(IModuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ModuleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(cancellationToken);
        return list.Select(ToDto).ToList();
    }

    public async Task<ModuleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<ModuleDto> CreateAsync(CreateModuleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Module
        {
            Code = request.Code,
            Name = request.Name,
            SortOrder = request.SortOrder,
            IsShow = request.IsShow,
            Icon = request.Icon,
            ClassCss = request.ClassCss,
            StyleCss = request.StyleCss,
            Link = request.Link,
            AllowFilterScope = request.AllowFilterScope,
            IsMobile = request.IsMobile,
        };
        var created = await _repository.CreateAsync(entity, cancellationToken);
        return ToDto(created);
    }

    public async Task<ModuleDto?> UpdateAsync(Guid id, UpdateModuleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.SortOrder = request.SortOrder;
        entity.IsShow = request.IsShow;
        entity.Icon = request.Icon;
        entity.ClassCss = request.ClassCss;
        entity.StyleCss = request.StyleCss;
        entity.Link = request.Link;
        entity.AllowFilterScope = request.AllowFilterScope;
        entity.IsMobile = request.IsMobile;
        await _repository.UpdateAsync(entity, cancellationToken);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, deletedById, cancellationToken);

    private static ModuleDto ToDto(Module m) =>
        new(
            m.Id,
            m.Code,
            m.Name,
            m.SortOrder,
            m.IsShow,
            m.Icon,
            m.ClassCss,
            m.StyleCss,
            m.Link,
            m.AllowFilterScope,
            m.IsMobile,
            m.CreatedAt);
}
