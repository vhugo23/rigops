using Microsoft.EntityFrameworkCore;
using RigOps.Api.Models;

namespace RigOps.Api.Data;

public class RigOpsDbContext : DbContext
{
    public RigOpsDbContext(DbContextOptions<RigOpsDbContext> options)
        : base(options)
    {
    }

    public DbSet<Rig> Rigs => Set<Rig>();
    public DbSet<Well> Wells => Set<Well>();
    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<Alert> Alerts => Set<Alert>();
}