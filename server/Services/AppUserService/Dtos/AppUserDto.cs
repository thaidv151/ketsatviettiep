using Model.Entities;

namespace Services.AppUserModule.Dtos;

public sealed record AppUserDto(
    Guid Id,
    string Email,
    string? Username,
    string? FullName,
    string? PhoneNumber,
    int? Gender,
    bool IsLocked,
    bool EmailConfirmed,
    bool IsFirstLogin,
    DateTime? LastLogin,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt)
{
    public static AppUserDto FromEntity(AppUser user) =>
        new(
            user.Id,
            user.Email,
            user.Username,
            user.FullName,
            user.PhoneNumber,
            user.Gender,
            user.IsLocked,
            user.EmailConfirmed,
            user.IsFirstLogin,
            user.LastLogin,
            user.CreatedAt,
            user.UpdatedAt);
}
