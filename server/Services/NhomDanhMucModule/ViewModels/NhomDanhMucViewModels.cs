using Services.Common;

namespace Services.NhomDanhMucModule.ViewModels;

public class NhomDanhMucSearch : SearchBase
{
    public string? Query { get; set; }
}

public class NhomDanhMucCreateVM
{
    public string MaNhomDanhMuc { get; set; } = string.Empty;
    public string TenNhomDanhMuc { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public int? ThuTuHienThi { get; set; }
}

public class NhomDanhMucEditVM : NhomDanhMucCreateVM
{
}
