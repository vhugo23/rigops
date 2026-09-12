namespace RigOps.Api.Models;

public class Rig
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Location { get; set; }

    public ICollection<Well> Wells { get; set; } = new List<Well>();
}