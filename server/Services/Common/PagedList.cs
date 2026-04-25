using Microsoft.EntityFrameworkCore;

namespace Services.Common;

public class PagedList<T>
{
    public List<T> Items { get; set; } = new();
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    public PagedList(List<T> items, int count, int pageIndex, int pageSize)
    {
        PageIndex = pageIndex;
        PageSize = pageSize;
        TotalCount = count;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        Items = items;
    }

    public static async Task<PagedList<T>> CreateAsync(IQueryable<T> source, SearchBase search)
    {
        var count = await source.CountAsync();
        var items = await source.Skip((search.PageIndex - 1) * search.PageSize)
                                .Take(search.PageSize)
                                .ToListAsync();
        return new PagedList<T>(items, count, search.PageIndex, search.PageSize);
    }
}
