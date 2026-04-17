using Model.Entities;
using Repositories.Common;

namespace Repositories.AppUserRepository;

public interface IAppUserRepository : IRepositoryBase<AppUser>
{
    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
}
