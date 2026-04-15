namespace Services.Rbac;

public interface IUserRoleService
{
    Task<IReadOnlyList<UserRoleDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<UserRoleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<UserRoleDto> CreateAsync(CreateUserRoleRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);
}
