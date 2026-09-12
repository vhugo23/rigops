namespace RigOps.Api.Models;

public enum AlertSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public enum AlertStatus
{
    New,
    Acknowledged,
    Investigating,
    Resolved
}

public class Alert
{
    public int Id { get; set; }
    public AlertSeverity Severity { get; set; }
    public required string Signal { get; set; }
    public double AnomalyScore { get; set; }
    public AlertStatus Status { get; set; } = AlertStatus.New;
    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;

    public int WellId { get; set; }
    public Well? Well { get; set; }
}