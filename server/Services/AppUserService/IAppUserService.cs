using Model.Entities;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Common;

namespace Services.AppUserModule;

public interface IAppUserService : IServiceBase<AppUser>
{
    Task<AppUserDto> CreateUserAsync(CreateAppUserRequest request, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppUserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);

    Task<AppUserDto?> GetUserDtoByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
