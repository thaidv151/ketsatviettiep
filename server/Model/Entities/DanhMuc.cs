using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities;

[Table("DanhMuc")]
public class DanhMuc : EntityBase
{
    [Required(ErrorMessage = "Mã danh mục không được để trống")]
    [MaxLength(100)]
    public string MaDanhMuc { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên danh mục không được để trống")]
    [MaxLength(250)]
    public string TenDanhMuc { get; set; } = string.Empty;

    public string? MoTa { get; set; }

    [Required(ErrorMessage = "Mã nhóm danh mục không được để trống")]
    [MaxLength(100)]
    public string MaNhomDanhMuc { get; set; } = string.Empty;

    public string? IconUrl { get; set; }
    
    [MaxLength(50)]
    public string? LoaiNgonNgu { get; set; }
    
    public int? ThuTuHienThi { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public string? DuongDanFile { get; set; }
    
    public string? UrlLink { get; set; }
}
