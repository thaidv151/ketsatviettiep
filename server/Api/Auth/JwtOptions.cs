namespace Api.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    /// <summary>HS256 — tối thiểu 32 byte (256 bit). Đổi bằng secret thật / biến môi trường khi deploy.</summary>
    public string SigningKey { get; set; } = string.Empty;

    public int ExpiresMinutes { get; set; } = 120;
}
