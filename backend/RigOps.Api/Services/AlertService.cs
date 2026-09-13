using Microsoft.EntityFrameworkCore;
using RigOps.Api.Data;
using RigOps.Api.Models;

namespace RigOps.Api.Services;

public class AlertService : IAlertService
{
    private static readonly Dictionary<AlertStatus, int> StatusOrder = new()
    {
        { AlertStatus.New, 0 },
        { AlertStatus.Acknowledged, 1 },
        { AlertStatus.Investigating, 2 },
        { AlertStatus.Resolved, 3 },
    };

    private readonly RigOpsDbContext _context;
    private readonly INotificationClient _notificationClient;
    private readonly ILogger<AlertService> _logger;

    public AlertService(RigOpsDbContext context, INotificationClient notificationClient, ILogger<AlertService> logger)
    {
        _context = context;
        _notificationClient = notificationClient;
        _logger = logger;
    }

    public async Task<AlertTransitionResult> TransitionStatusAsync(int alertId, AlertStatus newStatus)
    {
        var alert = await _context.Alerts.FirstOrDefaultAsync(a => a.Id == alertId);
        if (alert is null)
        {
            return new AlertTransitionResult { Success = false, ErrorMessage = "Alert not found." };
        }

        if (StatusOrder[newStatus] <= StatusOrder[alert.Status])
        {
            return new AlertTransitionResult
            {
                Success = false,
                ErrorMessage = $"Cannot move alert from {alert.Status} back to {newStatus}."
            };
        }

        alert.Status = newStatus;
        await _context.SaveChangesAsync();

        var notifyResult = await _notificationClient.SendAsync(alertId, "console");
        if (!notifyResult.Success)
        {
            _logger.LogWarning("Alert {AlertId} transitioned to {Status} but notification relay failed", alertId, newStatus);
        }

        return new AlertTransitionResult { Success = true, UpdatedAlert = alert };
    }
}