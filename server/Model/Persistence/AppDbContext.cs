using Microsoft.EntityFrameworkCore;
using Model.Entities;

namespace Model.Persistence;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AppUser> AppUsers => Set<AppUser>();

    public DbSet<Module> Modules => Set<Module>();

    public DbSet<Operation> Operations => Set<Operation>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<RoleOperation> RoleOperations => Set<RoleOperation>();

    public DbSet<UserRole> UserRoles => Set<UserRole>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.Username).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(256);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Avatar).HasMaxLength(500);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username)
                .IsUnique()
                .HasFilter("[Username] IS NOT NULL");
        });

        modelBuilder.Entity<Module>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.Code).HasMaxLength(250);
        });

        modelBuilder.Entity<Operation>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.HasIndex(e => e.ModuleId);
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.Code).HasMaxLength(250);
            entity.Property(e => e.Url).HasMaxLength(500);
            // Không cấu hình quan hệ EF — chỉ FK ModuleId.
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.HasIndex(e => e.Code).IsUnique().HasFilter("[IsDeleted] = 0");
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Code).HasMaxLength(100);
        });

        modelBuilder.Entity<RoleOperation>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.HasIndex(e => e.RoleId);
            entity.HasIndex(e => e.OperationId);
            entity.HasIndex(e => new { e.RoleId, e.OperationId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        });

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasQueryFilter(e => !e.IsDeleted);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.RoleId);
            entity.HasIndex(e => new { e.UserId, e.RoleId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        });
    }
}
