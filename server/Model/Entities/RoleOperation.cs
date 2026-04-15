using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("RoleOperations")]
public sealed class RoleOperation : EntityBase
{
    public Guid RoleId { get; set; }

    public Guid OperationId { get; set; }

    /// <summary>1 = được phép, 0 = không (tuỳ nghiệp vụ).</summary>
    public int IsAccess { get; set; }
}
