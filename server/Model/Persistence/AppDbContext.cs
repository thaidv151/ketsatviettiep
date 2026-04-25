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

    // ── Ecommerce ─────────────────────────────────────────────────────────────
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductAttribute> ProductAttributes => Set<ProductAttribute>();
    public DbSet<ProductAttributeValue> ProductAttributeValues => Set<ProductAttributeValue>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductVariantAttributeValue> ProductVariantAttributeValues => Set<ProductVariantAttributeValue>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();

    public DbSet<DanhMuc> DanhMucs => Set<DanhMuc>();
    public DbSet<NhomDanhMuc> NhomDanhMucs => Set<NhomDanhMuc>();

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

        // ── Category ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Category>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
            e.HasOne(x => x.Parent).WithMany()
                .HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        });

        // ── Brand ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Brand>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0 AND [Slug] IS NOT NULL");
        });

        // ── Product ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
            e.HasIndex(x => x.Sku).IsUnique().HasFilter("[IsDeleted] = 0 AND [Sku] IS NOT NULL");
        });

        modelBuilder.Entity<ProductAttribute>(e => e.HasQueryFilter(x => !x.IsDeleted));
        modelBuilder.Entity<ProductAttributeValue>(e => e.HasQueryFilter(x => !x.IsDeleted));

        modelBuilder.Entity<ProductVariant>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Sku).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        // Bảng nối — composite PK, không có EntityBase
        modelBuilder.Entity<ProductVariantAttributeValue>(e =>
        {
            e.HasKey(x => new { x.VariantId, x.AttributeValueId });
        });

        modelBuilder.Entity<ProductImage>(e => e.HasQueryFilter(x => !x.IsDeleted));

        // Tag + ProductTag
        modelBuilder.Entity<Tag>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Slug).IsUnique().HasFilter("[IsDeleted] = 0");
        });
        modelBuilder.Entity<ProductTag>(e =>
        {
            e.HasKey(x => new { x.ProductId, x.TagId });
        });

        // ── Coupon ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Coupon>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.Code).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        // ── CustomerAddress ───────────────────────────────────────────────────
        modelBuilder.Entity<CustomerAddress>(e => e.HasQueryFilter(x => !x.IsDeleted));

        // ── Order ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.OrderCode).IsUnique().HasFilter("[IsDeleted] = 0");
        });
        modelBuilder.Entity<OrderItem>(e => e.HasQueryFilter(x => !x.IsDeleted));
        modelBuilder.Entity<OrderStatusHistory>(e => e.HasQueryFilter(x => !x.IsDeleted));
        modelBuilder.Entity<Payment>(e => e.HasQueryFilter(x => !x.IsDeleted));

        // ── Cart ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Cart>(e => e.HasQueryFilter(x => !x.IsDeleted));
        modelBuilder.Entity<CartItem>(e => e.HasQueryFilter(x => !x.IsDeleted));

        // ── Review ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Review>(e => e.HasQueryFilter(x => !x.IsDeleted));

        // ── WishlistItem ──────────────────────────────────────────────────────
        modelBuilder.Entity<WishlistItem>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        // ── DanhMuc ───────────────────────────────────────────────────────────
        modelBuilder.Entity<DanhMuc>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.MaDanhMuc).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        modelBuilder.Entity<NhomDanhMuc>(e =>
        {
            e.HasQueryFilter(x => !x.IsDeleted);
            e.HasIndex(x => x.MaNhomDanhMuc).IsUnique().HasFilter("[IsDeleted] = 0");
        });

        // Tắt cascade delete cho tất cả các mối quan hệ (tránh lỗi multiple cascade paths)
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.NoAction;
        }
    }
}
