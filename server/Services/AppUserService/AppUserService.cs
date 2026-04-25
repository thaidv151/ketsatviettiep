using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.AppUserRepository;
using Repositories.ModuleRepository;
using Repositories.OperationRepository;
using Repositories.RoleOperationRepository;
using Repositories.UserRoleRepository;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.Common;

namespace Services.AppUserModule;

public sealed class AppUserService 
    : ServiceBase<AppUser, AppUserDto, CreateAppUserRequest, UpdateAppUserRequest>, IAppUserService
{
    private readonly IAppUserRepository _appUserRepo;
    private readonly IUserRoleRepository _userRoleRepo;
    private readonly IRoleOperationRepository _roleOpRepo;
    private readonly IOperationRepository _opRepo;
    private readonly IModuleRepository _moduleRepo;

    public AppUserService(
        IAppUserRepository repository, 
        IMapper mapper, 
        ILogger<AppUserService> logger,
        IUserRoleRepository userRoleRepo,
        IRoleOperationRepository roleOpRepo,
        IOperationRepository opRepo,
        IModuleRepository moduleRepo)
        : base(repository, mapper, logger)
    {
        _appUserRepo = repository;
        _userRoleRepo = userRoleRepo;
        _roleOpRepo = roleOpRepo;
        _opRepo = opRepo;
        _moduleRepo = moduleRepo;
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

    public async Task<UserInfoWithMenuDto?> GetUserInfoAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await GetByIdAsync(userId, ct);
        if (user is null) return null;

        // 1. Lấy danh sách RoleId của user
        var userRoles = await _userRoleRepo.GetAllAsync(ct);
        var roleIds = userRoles
            .Where(ur => ur.UserId == userId && ur.IsDeleted == false)
            .Select(ur => ur.RoleId)
            .ToList();

        // 2. Lấy danh sách OperationId từ các Role đó
        var roleOps = await _roleOpRepo.GetAllAsync(ct);
        var opIds = roleOps
            .Where(ro => roleIds.Contains(ro.RoleId) && ro.IsAccess == 1 && ro.IsDeleted == false)
            .Select(ro => ro.OperationId)
            .Distinct()
            .ToList();

        // 3. Lấy thông tin chi tiết Operation và Module
        var allOps = await _opRepo.GetAllAsync(ct);
        var accessibleOps = allOps
            .Where(o => opIds.Contains(o.Id) && o.IsShow && o.IsDeleted == false)
            .OrderBy(o => o.SortOrder)
            .ToList();

        var allModules = await _moduleRepo.GetAllAsync(ct);
        var moduleIdsWithAccess = accessibleOps.Select(o => o.ModuleId).Distinct().ToList();
        var accessibleModules = allModules
            .Where(m => moduleIdsWithAccess.Contains(m.Id) && m.IsShow && m.IsDeleted == false)
            .OrderBy(m => m.SortOrder)
            .ToList();

        // 4. Xây dựng cấu trúc menu
        var menuItems = new List<UserMenuItemDto>();
        
        // Luôn có menu Tổng quan
        menuItems.Add(new UserMenuItemDto("admin-home", "Tổng quan", "/dashboard", "LayoutDashboard"));

        foreach (var module in accessibleModules)
        {
            var children = accessibleOps
                .Where(o => o.ModuleId == module.Id)
                .Select(o => new UserMenuItemDto(
                    o.Code, 
                    o.Name, 
                    o.Url, 
                    o.Icon))
                .ToList();

            if (children.Count > 0)
            {
                menuItems.Add(new UserMenuItemDto(
                    module.Code ?? module.Id.ToString(),
                    module.Name,
                    null,
                    module.Icon,
                    children));
            }
        }

        return new UserInfoWithMenuDto(user, menuItems);
    }
}
