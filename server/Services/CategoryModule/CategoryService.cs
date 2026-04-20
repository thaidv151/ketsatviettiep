using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.CategoryRepository;
using Services.Common;

namespace Services.CategoryModule;

public sealed class CategoryService 
    : ServiceBase<Category, CategoryDto, CreateCategoryRequest, UpdateCategoryRequest>, ICategoryService
{
    public CategoryService(ICategoryRepository repo, IMapper mapper, ILogger<CategoryService> logger) 
        : base(repo, mapper, logger)
    {
    }

    // Nếu cần override hoặc thêm logic riêng thì viết tại đây
}
