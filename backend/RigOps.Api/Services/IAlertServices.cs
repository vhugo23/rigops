using RigOps.Api.Models;

namespace RigOps.Api.Services;

public interface IAlertService
{
    Task<AlertTransitionResult> TransitionStatusAsync(int alertId, AlertStatus newStatus);
}

public class AlertTransitionResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public Alert? UpdatedAlert { get; set; }
}