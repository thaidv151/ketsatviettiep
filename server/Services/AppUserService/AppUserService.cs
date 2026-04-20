using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.AppUserRepository;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Common;

namespace Services.AppUserModule;

public sealed class AppUserService 
    : ServiceBase<AppUser, AppUserDto, CreateAppUserRequest, UpdateAppUserRequest>, IAppUserService
{
    private readonly IAppUserRepository _appUserRepo;

    public AppUserService(IAppUserRepository repository, IMapper mapper, ILogger<AppUserService> logger)
        : base(repository, mapper, logger)
    {
        _appUserRepo = repository;
    }

    public override async Task<AppUserDto> CreateAsync(CreateAppUserRequest request, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new InvalidOperationException("Mật khẩu là bắt buộc.");

            var email = request.Email.Trim();
            var username = request.Username.Trim();
            
            if (await GetByEmailAsync(email, ct) is not null)
                throw new InvalidOperationException("Email đã tồn tại.");
            if (await GetByUsernameAsync(username, ct) is not null)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

            var entity = Mapper.Map<AppUser>(request);
            entity.PasswordHash = AppUserPasswordHasher.HashPassword(request.Password);
            entity.EmailConfirmed = false;
            entity.IsFirstLogin = true;

            var created = await Repository.CreateAsync(entity, ct);
            return Mapper.Map<AppUserDto>(created);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi tạo mới người dùng: {Email}", request.Email);
            throw;
        }
    }

    public override async Task<AppUserDto?> UpdateAsync(Guid id, UpdateAppUserRequest request, CancellationToken ct = default)
    {
        try
        {
            var entity = await Repository.GetByIdAsync(id, ct);
            if (entity == null) return null;

            var email = request.Email.Trim();
            var username = request.Username.Trim();
            
            if (await GetByEmailAsync(email, ct) is { } otherEmail && otherEmail.Id != id)
                throw new InvalidOperationException("Email đã tồn tại.");
            if (await GetByUsernameAsync(username, ct) is { } otherUser && otherUser.Id != id)
                throw new InvalidOperationException("Tên đăng nhập đã tồn tại.");

            Mapper.Map(request, entity);
            
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
                entity.PasswordHash = AppUserPasswordHasher.HashPassword(request.NewPassword.Trim());

            await Repository.UpdateAsync(entity, ct);
            return Mapper.Map<AppUserDto>(entity);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi cập nhật người dùng id: {Id}", id);
            throw;
        }
    }

    public async Task<AppUserDetailDto?> GetUserDetailByIdAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var entity = await Repository.GetByIdAsync(id, ct);
            return entity == null ? null : Mapper.Map<AppUserDetailDto>(entity);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "Lỗi khi lấy chi tiết người dùng id: {Id}", id);
            throw;
        }
    }

    public Task<AppUser?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Task.FromResult<AppUser?>(null);
        return _appUserRepo.GetByEmailAsync(email.Trim(), ct);
    }

    public Task<AppUser?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(username))
            return Task.FromResult<AppUser?>(null);
        return _appUserRepo.GetByUsernameAsync(username.Trim(), ct);
    }

    public async Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(login))
            return null;
        var trimmed = login.Trim();
        var byUsername = await GetByUsernameAsync(trimmed, ct);
        if (byUsername is not null)
            return byUsername;
        return await GetByEmailAsync(trimmed, ct);
    }
}
