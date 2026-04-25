namespace Services.Rbac;

public interface IRoleOperationService
{
    Task<IReadOnlyList<RoleOperationDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RoleOperationDto>> GetByRoleIdAsync(Guid roleId, CancellationToken cancellationToken = default);
    Task<RoleOperationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RoleOperationDto> CreateAsync(CreateRoleOperationRequest request, CancellationToken cancellationToken = default);
    Task<RoleOperationDto?> UpdateAsync(Guid id, UpdateRoleOperationRequest request, CancellationToken cancellationToken = default);
    Task SetRoleOperationsAsync(Guid roleId, List<Guid> operationIds, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);
}
