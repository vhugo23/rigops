namespace RigOps.Api.Models;

public enum WellStatus
{
    Normal,
    Warning,
    Critical,
    Offline
}

public class Well
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public WellStatus Status { get; set; } = WellStatus.Normal;
    public double CurrentDepth { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int RigId { get; set; }
    public Rig? Rig { get; set; }

    public ICollection<Operation> Operations { get; set; } = new List<Operation>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}