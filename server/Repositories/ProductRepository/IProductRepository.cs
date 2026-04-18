using Model.Entities;
using Repositories.Common;

namespace Repositories.ProductRepository;

public interface IProductRepository : IRepositoryBase<Product>
{
    /// <summary>Lấy product kèm Variants, Attributes, Images.</summary>
    Task<Product?> GetDetailAsync(Guid id, CancellationToken ct = default);

    /// <summary>Danh sách tối giản cho bảng admin.</summary>
    Task<IReadOnlyList<Product>> GetListAsync(CancellationToken ct = default);
}
