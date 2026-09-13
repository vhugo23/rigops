using System.Text;
using System.Text.Json;

namespace RigOps.Api.Services;

public class NotificationClient : INotificationClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<NotificationClient> _logger;

    public NotificationClient(IHttpClientFactory httpClientFactory, ILogger<NotificationClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<NotificationResult> SendAsync(int alertId, string channel)
    {
        var client = _httpClientFactory.CreateClient("NotificationService");

        try
        {
            var body = JsonSerializer.Serialize(new { alert_id = alertId, channel });
            var content = new StringContent(body, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/notify", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Notification service returned {StatusCode} for alert {AlertId}", response.StatusCode, alertId);
                return new NotificationResult { Success = false };
            }

            return new NotificationResult { Success = true };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to reach notification service for alert {AlertId}", alertId);
            return new NotificationResult { Success = false };
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Notification service request timed out for alert {AlertId}", alertId);
            return new NotificationResult { Success = false };
        }
    }
}