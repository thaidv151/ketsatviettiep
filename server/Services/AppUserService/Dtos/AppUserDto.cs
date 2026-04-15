using Model.Entities;

namespace Services.AppUserModule.Dtos;

public sealed record AppUserDto(Guid Id, string Email, string? DisplayName, DateTimeOffset CreatedAt)
{
    public static AppUserDto FromEntity(AppUser user) =>
        new(user.Id, user.Email, user.DisplayName, user.CreatedAt);
}
