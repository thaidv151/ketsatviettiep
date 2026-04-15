namespace Model.Entities;

/// <summary>
/// Không map bảng — dùng cho dữ liệu phi cấu trúc trả từ repository (ví dụ thông tin build).
/// </summary>
public sealed class SystemInfo
{
    public string Name { get; init; } = string.Empty;

    public string Version { get; init; } = string.Empty;

    public DateTimeOffset GeneratedAt { get; init; }
}
