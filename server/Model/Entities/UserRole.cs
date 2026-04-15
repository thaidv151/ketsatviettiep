using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("UserRoles")]
public sealed class UserRole : EntityBase
{
    public Guid UserId { get; set; }

    public Guid RoleId { get; set; }
}
