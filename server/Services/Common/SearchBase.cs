namespace Services.Common;

public class SearchBase
{
    public int PageIndex { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortColumn { get; set; }
    public string? SortOrder { get; set; }
}
