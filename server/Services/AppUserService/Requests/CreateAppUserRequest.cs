namespace Services.AppUserModule.Requests;

public sealed class CreateAppUserRequest
{
    public string Email { get; set; } = string.Empty;

    public string? DisplayName { get; set; }
}
