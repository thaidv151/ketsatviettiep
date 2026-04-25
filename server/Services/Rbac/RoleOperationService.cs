using Model.Entities;
using Repositories.OperationRepository;
using Repositories.RoleOperationRepository;
using Repositories.RoleRepository;

namespace Services.Rbac;

public sealed class RoleOperationService : IRoleOperationService
{
    private readonly IRoleOperationRepository _repo;
    private readonly IRoleRepository _roles;
    private readonly IOperationRepository _operations;

    public RoleOperationService(
        IRoleOperationRepository repo,
        IRoleRepository roles,
        IOperationRepository operations)
    {
        _repo = repo;
        _roles = roles;
        _operations = operations;
    }

    public async Task<IReadOnlyList<RoleOperationDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _repo.GetAllAsync(cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var ops = await _operations.GetAllAsync(cancellationToken);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        var opMap = ops.ToDictionary(o => o.Id, o => o.Name);
        return rows.Select(r => ToDto(r, roleMap.GetValueOrDefault(r.RoleId), opMap.GetValueOrDefault(r.OperationId))).ToList();
    }

    public async Task<IReadOnlyList<RoleOperationDto>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        var all = await GetAllAsync(cancellationToken);
        return all.Where(x => x.RoleId == roleId).ToList();
    }

    public async Task<RoleOperationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repo.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        var roles = await _roles.GetAllAsync(cancellationToken);
        var ops = await _operations.GetAllAsync(cancellationToken);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        var opMap = ops.ToDictionary(o => o.Id, o => o.Name);
        return ToDto(entity, roleMap.GetValueOrDefault(entity.RoleId), opMap.GetValueOrDefault(entity.OperationId));
    }

    public async Task<RoleOperationDto> CreateAsync(CreateRoleOperationRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new RoleOperation
        {
            RoleId = request.RoleId,
            OperationId = request.OperationId,
            IsAccess = request.IsAccess,
        };
        var created = await _repo.CreateAsync(entity, cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var ops = await _operations.GetAllAsync(cancellationToken);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        var opMap = ops.ToDictionary(o => o.Id, o => o.Name);
        return ToDto(created, roleMap.GetValueOrDefault(created.RoleId), opMap.GetValueOrDefault(created.OperationId));
    }

    public async Task<RoleOperationDto?> UpdateAsync(Guid id, UpdateRoleOperationRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repo.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        entity.IsAccess = request.IsAccess;
        await _repo.UpdateAsync(entity, cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var ops = await _operations.GetAllAsync(cancellationToken);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        var opMap = ops.ToDictionary(o => o.Id, o => o.Name);
        return ToDto(entity, roleMap.GetValueOrDefault(entity.RoleId), opMap.GetValueOrDefault(entity.OperationId));
    }

    public async Task SetRoleOperationsAsync(Guid roleId, List<Guid> operationIds, CancellationToken cancellationToken = default)
    {
        var existing = _repo.GetQueryable().Where(x => x.RoleId == roleId);
        foreach (var ro in existing)
        {
            ro.IsDeleted = true;
            ro.DeletedAt = DateTimeOffset.UtcNow;
        }

        foreach (var opId in operationIds)
        {
            await _repo.CreateAsync(new RoleOperation { RoleId = roleId, OperationId = opId, IsAccess = 1 }, cancellationToken);
        }
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => _repo.DeleteAsync(id, deletedById, cancellationToken);

    private static RoleOperationDto ToDto(RoleOperation ro, string? roleName, string? opName) =>
        new(ro.Id, ro.RoleId, roleName, ro.OperationId, opName, ro.IsAccess, ro.CreatedAt);
}
