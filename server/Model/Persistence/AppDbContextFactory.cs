using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Model.Persistence;

/// <summary>
/// Dùng khi chạy <c>dotnet ef</c> với startup project là Api (hoặc khi thiếu cấu hình runtime).
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlServer(
            "Server=WINDOWS-11\\SQLEXPRESS;Database=KetSatVietTiep_V2;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true");
        return new AppDbContext(optionsBuilder.Options);
    }
}
