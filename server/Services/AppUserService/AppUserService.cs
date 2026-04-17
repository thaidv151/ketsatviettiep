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
        if (string.IsNullOrWhiteSpace(request.Password))
            throw new InvalidOperationException("Mật khẩu là bắt buộc.");

        var email = request.Email.Trim();
        var username = request.Username.Trim();
        if (await GetByEmailAsync(email, cancellationToken) is not null)
            throw new InvalidOperationException("Email đã tồn tại.");
        if (await GetByUsernameAsync(username, cancellationToken) is not null)
            throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

        var entity = new AppUser
        {
            Email = email,
            Username = username,
            FullName = string.IsNullOrWhiteSpace(request.FullName)
                ? null
                : request.FullName.Trim(),
            NgaySinh = request.NgaySinh,
            Gender = request.Gender,
            Avatar = string.IsNullOrWhiteSpace(request.Avatar) ? null : request.Avatar.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim(),
            Province = string.IsNullOrWhiteSpace(request.Province) ? null : request.Province.Trim(),
            District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim(),
            Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim(),
            AddressDetail = string.IsNullOrWhiteSpace(request.AddressDetail) ? null : request.AddressDetail.Trim(),
            PasswordHash = AppUserPasswordHasher.HashPassword(request.Password),
            EmailConfirmed = false,
            AccessFailedCount = 0,
            LockoutEnd = null,
            IsLocked = false,
            IsFirstLogin = true,
            LastLogin = null,
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

    public async Task<AppUserDetailDto?> GetUserDetailByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken);
        return entity is null ? null : AppUserDetailDto.FromEntity(entity);
    }

    public async Task<AppUserDetailDto> UpdateUserAsync(Guid id, UpdateAppUserRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await GetByIdAsync(id, cancellationToken)
            ?? throw new InvalidOperationException("Không tìm thấy người dùng.");

        var email = request.Email.Trim();
        var username = request.Username.Trim();
        if (await GetByEmailAsync(email, cancellationToken) is { } otherEmail && otherEmail.Id != id)
            throw new InvalidOperationException("Email đã tồn tại.");
        if (await GetByUsernameAsync(username, cancellationToken) is { } otherUser && otherUser.Id != id)
            throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

        entity.Email = email;
        entity.Username = username;
        entity.FullName = string.IsNullOrWhiteSpace(request.FullName) ? null : request.FullName.Trim();
        entity.NgaySinh = request.NgaySinh;
        entity.Gender = request.Gender;
        entity.Avatar = string.IsNullOrWhiteSpace(request.Avatar) ? null : request.Avatar.Trim();
        entity.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        entity.Province = string.IsNullOrWhiteSpace(request.Province) ? null : request.Province.Trim();
        entity.District = string.IsNullOrWhiteSpace(request.District) ? null : request.District.Trim();
        entity.Ward = string.IsNullOrWhiteSpace(request.Ward) ? null : request.Ward.Trim();
        entity.AddressDetail = string.IsNullOrWhiteSpace(request.AddressDetail) ? null : request.AddressDetail.Trim();
        if (!string.IsNullOrWhiteSpace(request.NewPassword))
            entity.PasswordHash = AppUserPasswordHasher.HashPassword(request.NewPassword.Trim());
        entity.EmailConfirmed = request.EmailConfirmed;
        entity.IsLocked = request.IsLocked;
        entity.IsFirstLogin = request.IsFirstLogin;

        await UpdateAsync(entity, cancellationToken);
        return AppUserDetailDto.FromEntity(entity);
    }

    public Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Task.FromResult<AppUser?>(null);
        return ((IAppUserRepository)Repository).GetByEmailAsync(email, cancellationToken);
    }

    public Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Task.FromResult<AppUser?>(null);
        return ((IAppUserRepository)Repository).GetByUsernameAsync(username, cancellationToken);
    }

    public async Task<AppUser?> GetByLoginAsync(string login, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(login))
            return null;
        var trimmed = login.Trim();
        var byUsername = await GetByUsernameAsync(trimmed, cancellationToken);
        if (byUsername is not null)
            return byUsername;
        return await GetByEmailAsync(trimmed, cancellationToken);
    }
}
