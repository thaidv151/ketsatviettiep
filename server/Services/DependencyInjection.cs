using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Persistence;
using Repositories.AppInfo;
using Repositories.AppUserRepository;
using Repositories.ModuleRepository;
using Repositories.OperationRepository;
using Repositories.RoleOperationRepository;
using Repositories.RoleRepository;
using Repositories.UserRoleRepository;
using Services.AppInfo;
using Services.AppUserModule;
using Services.Mapping;
using Services.Rbac;

namespace Services;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Thiếu ConnectionStrings:DefaultConnection trong cấu hình.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        services.AddScoped<IAppUserRepository, AppUserRepository>();
        services.AddScoped<IAppInfoRepository, AppInfoRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<IOperationRepository, OperationRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleOperationRepository, RoleOperationRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();

        services.AddScoped<IAppUserService, AppUserService>();
        services.AddScoped<IAppInfoService, AppInfoService>();
        services.AddScoped<IModuleService, ModuleService>();
        services.AddScoped<IOperationService, OperationService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IRoleOperationService, RoleOperationService>();
        services.AddScoped<IUserRoleService, UserRoleService>();

        return services;
    }
}
