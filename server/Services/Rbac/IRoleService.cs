namespace Services.Rbac;

public interface IRoleService
{
    Task<IReadOnlyList<RoleDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<RoleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Vai trò đang hoạt động theo mã (Code), ví dụ NGUOIDUNG.</summary>
    Task<RoleDto?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    Task<RoleDto> CreateAsync(CreateRoleRequest request, CancellationToken cancellationToken = default);

    Task<RoleDto?> UpdateAsync(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);
}
