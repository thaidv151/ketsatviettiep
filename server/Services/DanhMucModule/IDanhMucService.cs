using Services.Common;
using Model.Entities;
using Services.DanhMucModule.Dtos;
using Services.DanhMucModule.ViewModels;

namespace Services.DanhMucModule;

public interface IDanhMucService : IServiceBase<DanhMuc, DanhMucDto, DanhMucCreateVM, DanhMucEditVM>
{
    Task<PagedList<DanhMucDto>> GetDataAsync(DanhMucSearch search, CancellationToken ct = default);
}
