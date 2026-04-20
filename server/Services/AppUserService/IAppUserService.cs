using Model.Entities;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Common;

namespace Services.AppUserModule;

public interface IAppUserService : IServiceBase<AppUser, AppUserDto, CreateAppUserRequest, UpdateAppUserRequest>
{
    Task<AppUserDetailDto?> GetUserDetailByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);

    /// <summary>Tìm user để đăng nhập: thử theo username trước, sau đó theo email.</summary>
    Task<AppUser?> GetByLoginAsync(string login, CancellationToken cancellationToken = default);
}
