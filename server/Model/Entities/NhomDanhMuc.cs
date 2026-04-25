using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("NhomDanhMuc")]
public class NhomDanhMuc : EntityBase
{
    [Required(ErrorMessage = "Mã nhóm danh mục không được để trống")]
    [MaxLength(100)]
    public string MaNhomDanhMuc { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên nhóm danh mục không được để trống")]
    [MaxLength(250)]
    public string TenNhomDanhMuc { get; set; } = string.Empty;

    public string? IconUrl { get; set; }
    
    public int? ThuTuHienThi { get; set; } = 0;
}
