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

    Task<AppUserDetailDto?> GetUserDetailByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<AppUserDetailDto> UpdateUserAsync(Guid id, UpdateAppUserRequest request, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>Tìm user để đăng nhập: thử theo username trước, sau đó theo email.</summary>
    Task<AppUser?> GetByLoginAsync(string login, CancellationToken cancellationToken = default);
}
