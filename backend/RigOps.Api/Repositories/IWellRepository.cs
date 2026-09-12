using RigOps.Api.Models;

namespace RigOps.Api.Repositories;

public interface IWellRepository
{
    Task<IEnumerable<Well>> GetAllAsync();
    Task<Well?> GetByIdAsync(int id);
    Task<Well> CreateAsync(Well well);
    Task<bool> UpdateAsync(Well well);
    Task<bool> DeleteAsync(int id);
}