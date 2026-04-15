using Model.Entities;
using Repositories.RoleRepository;

namespace Services.Rbac;

public sealed class RoleService : IRoleService
{
    private readonly IRoleRepository _repository;

    public RoleService(IRoleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var list = await _repository.GetAllAsync(cancellationToken);
        return list.Select(ToDto).ToList();
    }

    public async Task<RoleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Role
        {
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
        };
        var created = await _repository.CreateAsync(entity, cancellationToken);
        return ToDto(created);
    }

    public async Task<RoleDto?> UpdateAsync(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        entity.Name = request.Name;
        entity.Code = request.Code;
        entity.Type = request.Type;
        entity.IsActive = request.IsActive;
        await _repository.UpdateAsync(entity, cancellationToken);
        return ToDto(entity);
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, deletedById, cancellationToken);

    private static RoleDto ToDto(Role r) =>
        new(r.Id, r.Name, r.Code, r.Type, r.IsActive, r.CreatedAt);
}
