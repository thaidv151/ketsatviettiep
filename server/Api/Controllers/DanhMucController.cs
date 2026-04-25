using Microsoft.AspNetCore.Mvc;
using Services.DanhMucModule;
using Services.DanhMucModule.Dtos;
using Services.DanhMucModule.ViewModels;
using Services.Common;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DanhMucController : ControllerBase
{
    private readonly IDanhMucService _service;

    public DanhMucController(IDanhMucService service)
    {
        _service = service;
    }

    [HttpPost("GetData")]
    public async Task<IActionResult> GetData([FromBody] DanhMucSearch search)
    {
        var result = await _service.GetDataAsync(search);
        return Ok(ApiResponse<PagedList<DanhMucDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(ApiResponse<DanhMucDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DanhMucCreateVM model)
    {
        var result = await _service.CreateAsync(model);
        return Ok(ApiResponse<DanhMucDto>.Ok(result));
    }

    [HttpPost("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DanhMucEditVM model)
    {
        var result = await _service.UpdateAsync(id, model);
        if (result == null) return NotFound();
        return Ok(ApiResponse<DanhMucDto>.Ok(result));
    }

    [HttpPost("{id}/Delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.Ok("Xóa thành công"));
    }
}
