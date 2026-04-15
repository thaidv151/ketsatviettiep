using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("Modules")]
public sealed class Module : EntityBase
{
    [MaxLength(250)]
    public string? Code { get; set; }

    [Required]
    [MaxLength(250)]
    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }

    public bool IsShow { get; set; }

    [MaxLength(250)]
    public string? Icon { get; set; }

    [MaxLength(250)]
    public string? ClassCss { get; set; }

    [MaxLength(500)]
    public string? StyleCss { get; set; }

    [MaxLength(500)]
    public string? Link { get; set; }

    public bool? AllowFilterScope { get; set; }

    public bool? IsMobile { get; set; }
}
