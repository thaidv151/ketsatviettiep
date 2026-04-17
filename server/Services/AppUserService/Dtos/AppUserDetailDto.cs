using Model.Entities;

namespace Services.AppUserModule.Dtos;

public sealed record AppUserDetailDto(
    Guid Id,
    string Email,
    string? Username,
    string? FullName,
    string? PhoneNumber,
    DateTime? NgaySinh,
    int? Gender,
    string? Avatar,
    string? Province,
    string? District,
    string? Ward,
    string? AddressDetail,
    bool EmailConfirmed,
    int AccessFailedCount,
    DateTime? LockoutEnd,
    bool IsLocked,
    bool IsFirstLogin,
    DateTime? LastLogin,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt)
{
    public static AppUserDetailDto FromEntity(AppUser user) =>
        new(
            user.Id,
            user.Email,
            user.Username,
            user.FullName,
            user.PhoneNumber,
            user.NgaySinh,
            user.Gender,
            user.Avatar,
            user.Province,
            user.District,
            user.Ward,
            user.AddressDetail,
            user.EmailConfirmed,
            user.AccessFailedCount,
            user.LockoutEnd,
            user.IsLocked,
            user.IsFirstLogin,
            user.LastLogin,
            user.CreatedAt,
            user.UpdatedAt);
}
