using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.Admin;

[Authorize]
[ApiController]
[Route("api/admin/upload")]
public class AdminUploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<AdminUploadController> _logger;

    public AdminUploadController(IWebHostEnvironment env, ILogger<AdminUploadController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Không có file nào được tải lên." });

            // 1. Kiểm tra định dạng (whitelist)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Định dạng file không hỗ trợ." });

            // 2. Kiểm tra kích thước (ví dụ 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { message = "Dung lượng file vượt quá 5MB." });

            // 3. Tạo thư mục lưu trữ
            var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // 4. Tạo tên file duy nhất
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // 5. Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 6. Trả về URL và thông tin file
            var fileUrl = $"/uploads/{fileName}";
            
            return Ok(new
            {
                url = fileUrl,
                name = file.FileName,
                size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xử lý upload file: {FileName}", file?.FileName);
            return StatusCode(500, new { message = "Lỗi hệ thống khi tải file lên." });
        }
    }
}
