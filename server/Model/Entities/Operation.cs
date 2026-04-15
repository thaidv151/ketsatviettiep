using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("Operations")]
public sealed class Operation : EntityBase
{
    /// <summary>FK tới Modules — không dùng navigation property.</summary>
    public Guid ModuleId { get; set; }

    [Required]
    [MaxLength(250)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    [Required]
    [MaxLength(250)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Css { get; set; }

    public bool IsShow { get; set; }

    public int SortOrder { get; set; }

    [MaxLength(250)]
    public string? Icon { get; set; }
}
