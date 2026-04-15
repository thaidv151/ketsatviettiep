namespace Model.Entities;

/// <summary>
/// Lớp cha cho mọi thực thể map bảng — audit + xóa mềm.
/// </summary>
public abstract class EntityBase
{
    public Guid Id { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Id user tạo bản ghi (nullable nếu chưa gán).</summary>
    public Guid? CreatedById { get; set; }

    public DateTimeOffset? UpdatedAt { get; set; }

    public Guid? UpdatedById { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }

    public Guid? DeletedById { get; set; }
}
