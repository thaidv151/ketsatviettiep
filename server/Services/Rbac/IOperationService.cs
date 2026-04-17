namespace Services.Rbac;

public interface IOperationService
{
    Task<IReadOnlyList<OperationDto>> GetByModuleIdAsync(Guid moduleId, CancellationToken cancellationToken = default);

    Task<OperationDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<OperationDto> CreateAsync(CreateOperationRequest request, CancellationToken cancellationToken = default);

    Task<OperationDto?> UpdateAsync(Guid id, UpdateOperationRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);
}
