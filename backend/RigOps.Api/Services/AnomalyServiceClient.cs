using System.Text;

namespace RigOps.Api.Services;

public class AnomalyServiceClient : IAnomalyServiceClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AnomalyServiceClient> _logger;

    public AnomalyServiceClient(IHttpClientFactory httpClientFactory, ILogger<AnomalyServiceClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<AnomalyFetchResult> AnalyzeAsync(string wellId, string telemetryJson)
    {
        var client = _httpClientFactory.CreateClient("AiService");

        try
        {
            var content = new StringContent(telemetryJson, Encoding.UTF8, "application/json");
            var response = await client.PostAsync("/api/v1/anomalies/analyze", content);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Anomaly service returned {StatusCode} for well {WellId}",
                    response.StatusCode, wellId);
                return new AnomalyFetchResult { Success = false };
            }

            var json = await response.Content.ReadAsStringAsync();
            return new AnomalyFetchResult { Success = true, RawJson = json };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to reach anomaly service for well {WellId}", wellId);
            return new AnomalyFetchResult { Success = false };
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Anomaly service request timed out for well {WellId}", wellId);
            return new AnomalyFetchResult { Success = false };
        }
    }
}