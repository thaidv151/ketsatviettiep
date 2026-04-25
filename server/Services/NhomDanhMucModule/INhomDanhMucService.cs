using Services.Common;
using Model.Entities;
using Services.NhomDanhMucModule.Dtos;
using Services.NhomDanhMucModule.ViewModels;

namespace Services.NhomDanhMucModule;

public interface INhomDanhMucService : IServiceBase<NhomDanhMuc, NhomDanhMucDto, NhomDanhMucCreateVM, NhomDanhMucEditVM>
{
    Task<PagedList<NhomDanhMucDto>> GetDataAsync(NhomDanhMucSearch search, CancellationToken ct = default);
}
