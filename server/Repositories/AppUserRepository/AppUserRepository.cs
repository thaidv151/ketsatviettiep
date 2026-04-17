using Model.Entities;
using Model.Persistence;
using Microsoft.EntityFrameworkCore;
using Repositories.Common;

namespace Repositories.AppUserRepository;

public sealed class AppUserRepository : RepositoryBase<AppUser>, IAppUserRepository
{
    public AppUserRepository(AppDbContext db)
        : base(db)
    {
    }

    public async Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim();
        return await Db.Set<AppUser>()
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);
    }

    public async Task<AppUser?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        var normalized = username.Trim();
        return await Db.Set<AppUser>()
            .FirstOrDefaultAsync(u => u.Username == normalized, cancellationToken);
    }
}
