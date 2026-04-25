namespace Services.DanhMucModule.Dtos;

public class DanhMucDto
{
    public Guid Id { get; set; }
    public string MaDanhMuc { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string MaNhomDanhMuc { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string? LoaiNgonNgu { get; set; }
    public int? ThuTuHienThi { get; set; }
    public bool IsActive { get; set; }
    public string? DuongDanFile { get; set; }
    public string? UrlLink { get; set; }
}
