using System.Collections.Generic;

namespace Services.AppUserModule.Dtos;

public sealed record UserMenuItemDto(
    string Id,
    string Name,
    string? Href,
    string? Icon,
    List<UserMenuItemDto>? Children = null);

public sealed record UserInfoWithMenuDto(
    AppUserDto User,
    List<UserMenuItemDto> MenuItems,
    IReadOnlyList<string> RoleCodes);
