using Repositories.AppInfo;
using Services.AppInfo.Dtos;

namespace Services.AppInfo;

public sealed class AppInfoService : IAppInfoService
{
    private readonly IAppInfoRepository _repository;

    public AppInfoService(IAppInfoRepository repository)
    {
        _repository = repository;
    }

    public async Task<AppInfoDto> GetAppInfoAsync(CancellationToken cancellationToken = default)
    {
        var info = await _repository.GetSystemInfoAsync(cancellationToken);
        return new AppInfoDto(info.Name, info.Version, info.GeneratedAt);
    }
}
