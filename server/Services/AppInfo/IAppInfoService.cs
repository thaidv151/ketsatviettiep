using Services.AppInfo.Dtos;

namespace Services.AppInfo;

public interface IAppInfoService
{
    Task<AppInfoDto> GetAppInfoAsync(CancellationToken cancellationToken = default);
}
