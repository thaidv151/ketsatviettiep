using Model.Entities;
using Repositories.Common;

namespace Repositories.OperationRepository;

public interface IOperationRepository : IRepositoryBase<Operation>
{
    Task<IReadOnlyList<Operation>> GetByModuleIdAsync(Guid moduleId, CancellationToken cancellationToken = default);
}
