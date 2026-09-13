namespace RigOps.Api.Services;

public class TelemetryServiceClient : ITelemetryServiceClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TelemetryServiceClient> _logger;

    public TelemetryServiceClient(IHttpClientFactory httpClientFactory, ILogger<TelemetryServiceClient> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<TelemetryFetchResult> GetRecentReadingsAsync(int wellId, int limit = 50)
    {
        var client = _httpClientFactory.CreateClient("TelemetryService");

        try
        {
            var response = await client.GetAsync($"/telemetry/{wellId}?limit={limit}");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Telemetry service returned {StatusCode} for well {WellId}",
                    response.StatusCode, wellId);
                return new TelemetryFetchResult { Success = false };
            }

            var json = await response.Content.ReadAsStringAsync();
            return new TelemetryFetchResult { Success = true, RawJson = json };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Failed to reach telemetry service for well {WellId}", wellId);
            return new TelemetryFetchResult { Success = false };
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Telemetry service request timed out for well {WellId}", wellId);
            return new TelemetryFetchResult { Success = false };
        }
    }
}