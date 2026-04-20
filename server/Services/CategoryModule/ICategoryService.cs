using Model.Entities;
using Services.Common;

namespace Services.CategoryModule;

public interface ICategoryService : IServiceBase<Category, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>
{
}
