using Model.Entities;
using Repositories.AppUserRepository;
using Repositories.RoleRepository;
using Repositories.UserRoleRepository;

namespace Services.Rbac;

public sealed class UserRoleService : IUserRoleService
{
    private readonly IUserRoleRepository _repo;
    private readonly IAppUserRepository _users;
    private readonly IRoleRepository _roles;

    public UserRoleService(
        IUserRoleRepository repo,
        IAppUserRepository users,
        IRoleRepository roles)
    {
        _repo = repo;
        _users = users;
        _roles = roles;
    }

    public async Task<IReadOnlyList<UserRoleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _repo.GetAllAsync(cancellationToken);
        var users = await _users.GetAllAsync(cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Email);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        return rows.Select(ur => ToDto(ur, userMap.GetValueOrDefault(ur.UserId), roleMap.GetValueOrDefault(ur.RoleId))).ToList();
    }

    public async Task<UserRoleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repo.GetByIdAsync(id, cancellationToken);
        if (entity is null)
            return null;
        var users = await _users.GetAllAsync(cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Email);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        return ToDto(entity, userMap.GetValueOrDefault(entity.UserId), roleMap.GetValueOrDefault(entity.RoleId));
    }

    public async Task<UserRoleDto> CreateAsync(CreateUserRoleRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new UserRole
        {
            UserId = request.UserId,
            RoleId = request.RoleId,
        };
        var created = await _repo.CreateAsync(entity, cancellationToken);
        var users = await _users.GetAllAsync(cancellationToken);
        var roles = await _roles.GetAllAsync(cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Email);
        var roleMap = roles.ToDictionary(r => r.Id, r => r.Name);
        return ToDto(created, userMap.GetValueOrDefault(created.UserId), roleMap.GetValueOrDefault(created.RoleId));
    }

    public Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default)
        => _repo.DeleteAsync(id, deletedById, cancellationToken);

    private static UserRoleDto ToDto(UserRole ur, string? userEmail, string? roleName) =>
        new(ur.Id, ur.UserId, userEmail, ur.RoleId, roleName, ur.CreatedAt);
}
