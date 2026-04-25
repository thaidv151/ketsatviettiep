using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.DanhMucRepository;
using Services.Common;
using Services.DanhMucModule.Dtos;
using Services.DanhMucModule.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Services.DanhMucModule;

public class DanhMucService 
    : ServiceBase<DanhMuc, DanhMucDto, DanhMucCreateVM, DanhMucEditVM>, IDanhMucService
{
    public DanhMucService(IDanhMucRepository repository, IMapper mapper, ILogger<DanhMucService> logger) 
        : base(repository, mapper, logger)
    {
    }

    public async Task<PagedList<DanhMucDto>> GetDataAsync(DanhMucSearch search, CancellationToken ct = default)
    {
        var query = Repository.GetQueryable().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search.Query))
        {
            query = query.Where(x => x.TenDanhMuc.Contains(search.Query) || x.MaDanhMuc.Contains(search.Query));
        }

        if (!string.IsNullOrWhiteSpace(search.MaNhomDanhMuc))
        {
            query = query.Where(x => x.MaNhomDanhMuc == search.MaNhomDanhMuc);
        }

        var dtoList = query.Select(x => Mapper.Map<DanhMucDto>(x));
        return await PagedList<DanhMucDto>.CreateAsync(dtoList, search);
    }
}
