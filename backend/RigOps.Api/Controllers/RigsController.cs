using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RigOps.Api.Data;
using RigOps.Api.Models;

namespace RigOps.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RigsController : ControllerBase
{
    private readonly RigOpsDbContext _context;

    public RigsController(RigOpsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Rig>>> GetAll()
    {
        var rigs = await _context.Rigs.ToListAsync();
        return Ok(rigs);
    }

    [HttpPost]
    public async Task<ActionResult<Rig>> Create(Rig rig)
    {
        _context.Rigs.Add(rig);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = rig.Id }, rig);
    }
}