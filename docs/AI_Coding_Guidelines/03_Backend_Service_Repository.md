# Chuẩn viết Service & Repository (Backend)

Phần này xử lý logic nghiệp vụ và truy xuất Database. Chúng ta sử dụng mô hình **Base Service** để dùng chung các logic cơ bản (CRUD).

## 1. Repository (Data Access)
- Vị trí: `server/Repositories/[Entity]Repository/`
- Trách nhiệm: Truy xuất trực tiếp tới Entity Framework Core (`DbContext`).

## 2. Base Service (Dùng chung logic)
Để tránh lặp lại code, các logic `GetById`, `Create`, `Update`, `Delete` cơ bản được đưa vào `BaseService`.

```csharp
public interface IBaseService<TEntity, TDto, TCreateRequest, TUpdateRequest>
{
    Task<IEnumerable<TDto>> GetAllAsync(CancellationToken ct);
    Task<TDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<TDto> CreateAsync(TCreateRequest request, CancellationToken ct);
    Task<TDto?> UpdateAsync(Guid id, TUpdateRequest request, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}

public abstract class BaseService<TEntity, TDto, TCreateRequest, TUpdateRequest> 
    : IBaseService<TEntity, TDto, TCreateRequest, TUpdateRequest> 
    where TEntity : class
{
    protected readonly IRepository<TEntity> _repo; // Hoặc Generic Repository
    protected readonly IMapper _mapper;
    protected readonly ILogger _logger;

    protected BaseService(IRepository<TEntity> repo, IMapper mapper, ILogger logger)
    {
        _repo = repo;
        _mapper = mapper;
        _logger = logger;
    }

    public virtual async Task<IEnumerable<TDto>> GetAllAsync(CancellationToken ct)
    {
        var entities = await _repo.GetAllAsync(ct);
        return _mapper.Map<IEnumerable<TDto>>(entities);
    }

    public virtual async Task<TDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        return entity == null ? default : _mapper.Map<TDto>(entity);
    }

    public virtual async Task<TDto> CreateAsync(TCreateRequest request, CancellationToken ct)
    {
        var entity = _mapper.Map<TEntity>(request);
        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct); // Chịu trách nhiệm save dữ liệu
        return _mapper.Map<TDto>(entity);
    }

    public virtual async Task<TDto?> UpdateAsync(Guid id, TUpdateRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity == null) return default;
        
        _mapper.Map(request, entity);
        await _repo.UpdateAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return _mapper.Map<TDto>(entity);
    }

    public virtual async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(id, ct);
        if (entity != null)
        {
            await _repo.DeleteAsync(entity, ct);
            await _repo.SaveChangesAsync(ct);
        }
    }
}
```

## 3. Khai báo Service cụ thể
Các Service cụ thể sẽ kế thừa từ `BaseService`.

```csharp
public interface IProductService : IBaseService<Product, ProductDto, CreateProductRequest, UpdateProductRequest> 
{
    // Thêm các hàm logic đặc thù của Product tại đây
}

public sealed class ProductService : BaseService<Product, ProductDto, CreateProductRequest, UpdateProductRequest>, IProductService
{
    public ProductService(IProductRepository repo, IMapper mapper, ILogger<ProductService> logger) 
        : base(repo, mapper, logger)
    {
    }
}
```
