using System.Linq;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Model.Persistence;
using Repositories.Common;
using Services.Common;
using Services.Mapping;

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

        // Tự động đăng ký DI theo quy ước
        services.AddDependencyInjection();

        return services;
    }

    public static void AddDependencyInjection(this IServiceCollection services)
    {
        // Đăng ký các Base Generic (IRepositoryBase<T> — RepositoryBase<T> là class cụ thể)
        services.AddScoped(typeof(IRepositoryBase<>), typeof(RepositoryBase<>));
        // Không đăng ký IServiceBase<,,,> → ServiceBase<,,,>: ServiceBase là abstract; dùng INxxxService / NxxxService theo convention bên dưới.

        // Quét Services
        var serviceAssembly = typeof(ServiceBase<,,,>).Assembly;
        RegisterByConvention(services, serviceAssembly, "Service");

        // Quét Repositories
        var repositoryAssembly = typeof(RepositoryBase<>).Assembly;
        RegisterByConvention(services, repositoryAssembly, "Repository");
    }

    private static void RegisterByConvention(IServiceCollection services, Assembly assembly, string suffix)
    {
        var types = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Name.EndsWith(suffix))
            .ToList();

        foreach (var implementationType in types)
        {
            var interfaceName = "I" + implementationType.Name;
            var serviceInterface = implementationType.GetInterfaces()
                .FirstOrDefault(i => i.Name == interfaceName);

            if (serviceInterface != null)
            {
                services.AddScoped(serviceInterface, implementationType);
            }
        }
    }
}
