using AutoMapper;
using Model.Entities;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.CategoryModule;

namespace Services.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Category
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ParentName, opt => opt.MapFrom(src => src.Parent != null ? src.Parent.Name : null));
            
        CreateMap<CreateCategoryRequest, Category>();
        CreateMap<UpdateCategoryRequest, Category>();

        // AppUser
        CreateMap<AppUser, AppUserDto>();
        CreateMap<AppUser, AppUserDetailDto>();
        CreateMap<CreateAppUserRequest, AppUser>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Xử lý hash riêng
        CreateMap<UpdateAppUserRequest, AppUser>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
    }
}
