using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Services.ProductModule;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/products")]
public sealed class AdminProductsController : ControllerBase
{
    private readonly IProductService _service;

    public AdminProductsController(IProductService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken ct)
        => Ok(await _service.GetListAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken ct)
    {
        var item = await _service.GetDetailAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        try
        {
            var created = await _service.CreateAsync(request, ct);
            return CreatedAtAction(nameof(GetDetail), new { id = created.Id }, created);
        }
        catch (Exception ex) when (TryGetDuplicateKeyMessage(ex, out var duplicateMessage))
        {
            return Conflict(new { message = duplicateMessage });
        }
        catch (Exception ex) when (TryGetReferenceConstraintMessage(ex, out var referenceMessage))
        {
            return Conflict(new { message = referenceMessage });
        }
    }

    [HttpPost("{id:guid}/update")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
    {
        try
        {
            var updated = await _service.UpdateAsync(id, request, ct);
            return updated is null ? NotFound() : Ok(updated);
        }
        catch (Exception ex) when (TryGetDuplicateKeyMessage(ex, out var duplicateMessage))
        {
            return Conflict(new { message = duplicateMessage });
        }
        catch (Exception ex) when (TryGetReferenceConstraintMessage(ex, out var referenceMessage))
        {
            return Conflict(new { message = referenceMessage });
        }
    }

    [HttpPost("{id:guid}/delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _service.DeleteAsync(id, deletedById: null, ct);
        return NoContent();
    }

    private static bool TryGetDuplicateKeyMessage(Exception ex, out string message)
    {
        message = string.Empty;

        var sqlEx = ex switch
        {
            DbUpdateException dbEx when dbEx.InnerException is SqlException innerSql => innerSql,
            SqlException directSql => directSql,
            _ => null
        };

        if (sqlEx is null || (sqlEx.Number != 2601 && sqlEx.Number != 2627))
            return false;

        var raw = sqlEx.Message;
        if (raw.Contains("IX_Products_Sku", StringComparison.OrdinalIgnoreCase))
        {
            message = "SKU đã tồn tại. Vui lòng nhập SKU khác.";
            return true;
        }

        if (raw.Contains("IX_Products_Slug", StringComparison.OrdinalIgnoreCase))
        {
            message = "Slug đã tồn tại. Vui lòng nhập slug khác.";
            return true;
        }

        message = "Dữ liệu bị trùng khóa duy nhất. Vui lòng kiểm tra lại SKU/slug.";
        return true;
    }

    private static bool TryGetReferenceConstraintMessage(Exception ex, out string message)
    {
        message = string.Empty;

        var sqlEx = ex switch
        {
            DbUpdateException dbEx when dbEx.InnerException is SqlException innerSql => innerSql,
            SqlException directSql => directSql,
            _ => null
        };

        if (sqlEx is null || sqlEx.Number != 547)
            return false;

        if (sqlEx.Message.Contains("FK_OrderItems_ProductVariants_VariantId", StringComparison.OrdinalIgnoreCase))
        {
            message = "Không thể thay đổi biến thể vì sản phẩm đã phát sinh đơn hàng. Vui lòng giữ nguyên biến thể đã bán.";
            return true;
        }

        message = "Không thể cập nhật do dữ liệu đang được tham chiếu ở nơi khác.";
        return true;
    }
}
