using RigOps.Api.Models;

namespace RigOps.Api.DTOs;

public class WellDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public WellStatus Status { get; set; }
    public double CurrentDepth { get; set; }
    public DateTime CreatedAt { get; set; }
    public int RigId { get; set; }
    public string? RigName { get; set; }
}