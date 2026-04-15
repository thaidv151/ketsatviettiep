namespace Services.Rbac;

public interface IModuleService
{
    Task<IReadOnlyList<ModuleDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<ModuleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ModuleDto> CreateAsync(CreateModuleRequest request, CancellationToken cancellationToken = default);

    Task<ModuleDto?> UpdateAsync(Guid id, UpdateModuleRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, Guid? deletedById, CancellationToken cancellationToken = default);
}
