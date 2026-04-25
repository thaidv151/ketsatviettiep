using AutoMapper;
using Microsoft.Extensions.Logging;
using Model.Entities;
using Repositories.NhomDanhMucRepository;
using Services.Common;
using Services.NhomDanhMucModule.Dtos;
using Services.NhomDanhMucModule.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace Services.NhomDanhMucModule;

public class NhomDanhMucService 
    : ServiceBase<NhomDanhMuc, NhomDanhMucDto, NhomDanhMucCreateVM, NhomDanhMucEditVM>, INhomDanhMucService
{
    public NhomDanhMucService(INhomDanhMucRepository repository, IMapper mapper, ILogger<NhomDanhMucService> logger) 
        : base(repository, mapper, logger)
    {
    }

    public async Task<PagedList<NhomDanhMucDto>> GetDataAsync(NhomDanhMucSearch search, CancellationToken ct = default)
    {
        var query = Repository.GetQueryable().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search.Query))
        {
            query = query.Where(x => x.TenNhomDanhMuc.Contains(search.Query) || x.MaNhomDanhMuc.Contains(search.Query));
        }

        var dtoList = query.Select(x => Mapper.Map<NhomDanhMucDto>(x));
        return await PagedList<NhomDanhMucDto>.CreateAsync(dtoList, search);
    }
}
