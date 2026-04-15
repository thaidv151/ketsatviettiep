using Model.Entities;

namespace Repositories.AppInfo;

/// <summary>
/// Module không dùng EF — trả về <see cref="SystemInfo"/> trong Model (không DTO).
/// </summary>
public interface IAppInfoRepository
{
    Task<SystemInfo> GetSystemInfoAsync(CancellationToken cancellationToken = default);
}
