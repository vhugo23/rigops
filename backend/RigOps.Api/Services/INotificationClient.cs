namespace RigOps.Api.Services;

public interface INotificationClient
{
    Task<NotificationResult> SendAsync(int alertId, string channel);
}

public class NotificationResult
{
    public bool Success { get; set; }
}