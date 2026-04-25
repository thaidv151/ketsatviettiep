namespace Services.Common;

public class ApiResponse<T>
{
    public bool Status { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T> { Status = true, Data = data, Message = message };
    }

    public static ApiResponse<T> Fail(string message)
    {
        return new ApiResponse<T> { Status = false, Message = message };
    }
}
