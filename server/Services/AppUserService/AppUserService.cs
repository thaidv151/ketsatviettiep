using Model.Entities;
using Repositories.AppUserRepository;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Common;

namespace Services.AppUserModule;

public sealed class AppUserService : ServiceBase<AppUser>, IAppUserService
{
    public AppUserService(IAppUserRepository repository)
        : base(repository)
    {
    }

    public async Task<AppUserDto> CreateUserAsync(CreateAppUserRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new AppUser
        {
            Email = request.Email.Trim(),
            DisplayName = string.IsNullOrWhiteSpace(request.DisplayName)
                ? null
                : request.DisplayName.Trim(),
        };
        var created = await CreateAsync(entity, cancellationToken);
        return AppUserDto.FromEntity(created);
    }

    public async Task<IReadOnlyList<AppUserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var list = await GetAllAsync(cancellationToken);
        return list.Select(AppUserDto.FromEntity).ToList();
    }

    public async Task<AppUserDto?> GetUserDtoByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        return entity is null ? null : AppUserDto.FromEntity(entity);
    }
}
