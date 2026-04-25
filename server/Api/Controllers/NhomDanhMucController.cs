using Microsoft.AspNetCore.Mvc;
using Services.NhomDanhMucModule;
using Services.NhomDanhMucModule.Dtos;
using Services.NhomDanhMucModule.ViewModels;
using Services.Common;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NhomDanhMucController : ControllerBase
{
    private readonly INhomDanhMucService _service;

    public NhomDanhMucController(INhomDanhMucService service)
    {
        _service = service;
    }

    [HttpPost("GetData")]
    public async Task<IActionResult> GetData([FromBody] NhomDanhMucSearch search)
    {
        var result = await _service.GetDataAsync(search);
        return Ok(ApiResponse<PagedList<NhomDanhMucDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(ApiResponse<NhomDanhMucDto>.Ok(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] NhomDanhMucCreateVM model)
    {
        var result = await _service.CreateAsync(model);
        return Ok(ApiResponse<NhomDanhMucDto>.Ok(result));
    }

    [HttpPost("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] NhomDanhMucEditVM model)
    {
        var result = await _service.UpdateAsync(id, model);
        if (result == null) return NotFound();
        return Ok(ApiResponse<NhomDanhMucDto>.Ok(result));
    }

    [HttpPost("{id}/Delete")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return Ok(ApiResponse<string>.Ok("Xóa thành công"));
    }
}
