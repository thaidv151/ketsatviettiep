using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Persistence;
using Repositories.AppInfo;
using Repositories.AppUserRepository;
using Repositories.BrandRepository;
using Repositories.CategoryRepository;
using Repositories.CouponRepository;
using Repositories.ModuleRepository;
using Repositories.OperationRepository;
using Repositories.OrderRepository;
using Repositories.ProductRepository;
using Repositories.RoleOperationRepository;
using Repositories.RoleRepository;
using Repositories.UserRoleRepository;
using Services.AppInfo;
using Services.AppUserModule;
using Services.BrandModule;
using Services.CategoryModule;
using Services.CouponModule;
using Services.Mapping;
using Services.OrderModule;
using Services.ProductModule;
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

        // ── Existing repositories ──────────────────────────────────────────────
        services.AddScoped<IAppUserRepository, AppUserRepository>();
        services.AddScoped<IAppInfoRepository, AppInfoRepository>();
        services.AddScoped<IModuleRepository, ModuleRepository>();
        services.AddScoped<IOperationRepository, OperationRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IRoleOperationRepository, RoleOperationRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();

        // ── Ecommerce repositories ─────────────────────────────────────────────
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();

        // ── Existing services ──────────────────────────────────────────────────
        services.AddScoped<IAppUserService, AppUserService>();
        services.AddScoped<IAppInfoService, AppInfoService>();
        services.AddScoped<IModuleService, ModuleService>();
        services.AddScoped<IOperationService, OperationService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IRoleOperationService, RoleOperationService>();
        services.AddScoped<IUserRoleService, UserRoleService>();

        // ── Ecommerce services ─────────────────────────────────────────────────
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ICouponService, CouponService>();

        return services;
    }
}
