namespace Services.AppInfo.Dtos;

public sealed record AppInfoDto(string Name, string Version, DateTimeOffset GeneratedAt);
