using Model.Entities;
using Services.Common;

namespace Services.CategoryModule;

public interface ICategoryService : IServiceBase<Category, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>
{
    Task<PagedList<CategoryDto>> GetDataAsync(CategorySearch search, CancellationToken ct = default);
}
