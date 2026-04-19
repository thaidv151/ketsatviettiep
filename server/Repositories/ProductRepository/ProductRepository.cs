using Microsoft.EntityFrameworkCore;
using Model.Entities;
using Model.Persistence;
using Repositories.Common;

namespace Repositories.ProductRepository;

public sealed class ProductRepository : RepositoryBase<Product>, IProductRepository
{
    public ProductRepository(AppDbContext db) : base(db) { }

    public async Task<IReadOnlyList<Product>> GetListAsync(CancellationToken ct = default)
        => await Db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

    public async Task<Product?> GetDetailAsync(Guid id, CancellationToken ct = default)
        => await Db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
}
