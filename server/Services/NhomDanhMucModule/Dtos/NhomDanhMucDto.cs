namespace Services.NhomDanhMucModule.Dtos;

public class NhomDanhMucDto
{
    public Guid Id { get; set; }
    public string MaNhomDanhMuc { get; set; } = string.Empty;
    public string TenNhomDanhMuc { get; set; } = string.Empty;
    public string? IconUrl { get; set; }
    public int? ThuTuHienThi { get; set; }
}
