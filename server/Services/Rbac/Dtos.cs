namespace Services.Rbac;

public sealed record ModuleDto(
    Guid Id,
    string? Code,
    string Name,
    int SortOrder,
    bool IsShow,
    string? Icon,
    string? ClassCss,
    string? StyleCss,
    string? Link,
    bool? AllowFilterScope,
    bool? IsMobile,
    DateTimeOffset CreatedAt);

public sealed class CreateModuleRequest
{
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsShow { get; set; } = true;
    public string? Icon { get; set; }
    public string? ClassCss { get; set; }
    public string? StyleCss { get; set; }
    public string? Link { get; set; }
    public bool? AllowFilterScope { get; set; }
    public bool? IsMobile { get; set; }
}

public sealed class UpdateModuleRequest
{
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsShow { get; set; }
    public string? Icon { get; set; }
    public string? ClassCss { get; set; }
    public string? StyleCss { get; set; }
    public string? Link { get; set; }
    public bool? AllowFilterScope { get; set; }
    public bool? IsMobile { get; set; }
}

public sealed record OperationDto(
    Guid Id,
    Guid ModuleId,
    string? ModuleName,
    string Name,
    string Url,
    string Code,
    string? Css,
    bool IsShow,
    int SortOrder,
    string? Icon,
    DateTimeOffset CreatedAt);

public sealed class CreateOperationRequest
{
    public Guid ModuleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Css { get; set; }
    public bool IsShow { get; set; } = true;
    public int SortOrder { get; set; }
    public string? Icon { get; set; }
}

public sealed class UpdateOperationRequest
{
    public Guid ModuleId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Css { get; set; }
    public bool IsShow { get; set; }
    public int SortOrder { get; set; }
    public string? Icon { get; set; }
}

public sealed record RoleDto(
    Guid Id,
    string Name,
    string Code,
    string? Type,
    bool IsActive,
    DateTimeOffset CreatedAt);

public sealed class CreateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Type { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateRoleRequest
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Type { get; set; }
    public bool IsActive { get; set; }
}

public sealed record RoleOperationDto(
    Guid Id,
    Guid RoleId,
    string? RoleName,
    Guid OperationId,
    string? OperationName,
    int IsAccess,
    DateTimeOffset CreatedAt);

public sealed class CreateRoleOperationRequest
{
    public Guid RoleId { get; set; }
    public Guid OperationId { get; set; }
    public int IsAccess { get; set; } = 1;
}

public sealed class UpdateRoleOperationRequest
{
    public int IsAccess { get; set; }
}

public sealed record UserRoleDto(
    Guid Id,
    Guid UserId,
    string? UserEmail,
    Guid RoleId,
    string? RoleName,
    DateTimeOffset CreatedAt);

public sealed class CreateUserRoleRequest
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
}
