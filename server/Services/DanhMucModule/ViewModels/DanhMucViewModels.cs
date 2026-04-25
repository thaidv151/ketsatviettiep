using Services.Common;

namespace Services.DanhMucModule.ViewModels;

public class DanhMucSearch : SearchBase
{
    public string? Query { get; set; }
    public string? MaNhomDanhMuc { get; set; }
}

public class DanhMucCreateVM
{
    public string MaDanhMuc { get; set; } = string.Empty;
    public string TenDanhMuc { get; set; } = string.Empty;
    public string? MoTa { get; set; }
    public string MaNhomDanhMuc { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public string? LoaiNgonNgu { get; set; }
    public int? ThuTuHienThi { get; set; }
    public bool IsActive { get; set; } = true;
    public string? DuongDanFile { get; set; }
    public string? UrlLink { get; set; }
}

public class DanhMucEditVM : DanhMucCreateVM
{
}
