namespace RigOps.Api.Models;

public enum OperationType
{
    Drilling,
    Tripping,
    Casing,
    Cementing,
    Testing
}

public class Operation
{
    public int Id { get; set; }
    public OperationType OperationType { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }

    public int WellId { get; set; }
    public Well? Well { get; set; }
}