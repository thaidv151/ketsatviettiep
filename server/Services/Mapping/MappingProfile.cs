using AutoMapper;
using Model.Entities;
using Services.AppUserModule.Dtos;
using Services.AppUserModule.Requests;
using Services.CategoryModule;
using Services.DanhMucModule.Dtos;
using Services.DanhMucModule.ViewModels;
using Services.NhomDanhMucModule.Dtos;
using Services.NhomDanhMucModule.ViewModels;

namespace Services.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Category — DTO là record positional; AutoMapper cần ConstructUsing/ConvertUsing.
        CreateMap<Category, CategoryDto>()
            .ConvertUsing(src => new CategoryDto(
                src.Id,
                src.ParentId,
                src.Parent != null ? src.Parent.Name : null,
                src.Name,
                src.Slug,
                src.Description,
                src.ImageUrl,
                src.SortOrder,
                src.IsActive,
                0,
                src.CreatedAt));

        CreateMap<CreateCategoryRequest, Category>();
        CreateMap<UpdateCategoryRequest, Category>();

        // AppUser
        CreateMap<AppUser, AppUserDto>();
        CreateMap<AppUser, AppUserDetailDto>();
        CreateMap<CreateAppUserRequest, AppUser>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()); // Xử lý hash riêng
        CreateMap<UpdateAppUserRequest, AppUser>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());

        // DanhMuc
        CreateMap<DanhMuc, DanhMucDto>();
        CreateMap<DanhMucCreateVM, DanhMuc>();
        CreateMap<DanhMucEditVM, DanhMuc>();

        // NhomDanhMuc
        CreateMap<NhomDanhMuc, NhomDanhMucDto>();
        CreateMap<NhomDanhMucCreateVM, NhomDanhMuc>();
        CreateMap<NhomDanhMucEditVM, NhomDanhMuc>();
    }
}
