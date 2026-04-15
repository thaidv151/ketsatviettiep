using Model.Entities;

namespace Repositories.AppInfo;

public sealed class AppInfoRepository : IAppInfoRepository
{
    public Task<SystemInfo> GetSystemInfoAsync(CancellationToken cancellationToken = default)
    {
        var info = new SystemInfo
        {
            Name = "Api",
            Version = "1.0.0",
            GeneratedAt = DateTimeOffset.UtcNow,
        };
        return Task.FromResult(info);
    }
}
