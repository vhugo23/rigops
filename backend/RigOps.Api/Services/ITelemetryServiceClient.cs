namespace RigOps.Api.Services;

public interface ITelemetryServiceClient
{
    Task<TelemetryFetchResult> GetRecentReadingsAsync(int wellId, int limit = 50);
}

public class TelemetryFetchResult
{
    public bool Success { get; set; }
    public string? RawJson { get; set; }
}