namespace RigOps.Api.Services;

public interface IAnomalyServiceClient
{
    Task<AnomalyFetchResult> AnalyzeAsync(string wellId, string telemetryJson);
}

public class AnomalyFetchResult
{
    public bool Success { get; set; }
    public string? RawJson { get; set; }
}