using Microsoft.EntityFrameworkCore;
using RigOps.Api.Data;
using RigOps.Api.Models;

namespace RigOps.Api.Repositories;

public class WellRepository : IWellRepository
{
    private readonly RigOpsDbContext _context;

    public WellRepository(RigOpsDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Well>> GetAllAsync()
    {
        return await _context.Wells.Include(w => w.Rig).ToListAsync();
    }

    public async Task<Well?> GetByIdAsync(int id)
    {
        return await _context.Wells.Include(w => w.Rig).FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<Well> CreateAsync(Well well)
    {
        _context.Wells.Add(well);
        await _context.SaveChangesAsync();
        return well;
    }

    public async Task<bool> UpdateAsync(Well well)
    {
        var exists = await _context.Wells.AnyAsync(w => w.Id == well.Id);
        if (!exists)
        {
            return false;
        }

        _context.Wells.Update(well);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var well = await _context.Wells.FindAsync(id);
        if (well is null)
        {
            return false;
        }

        _context.Wells.Remove(well);
        await _context.SaveChangesAsync();
        return true;
    }
}