using Microsoft.AspNetCore.Mvc;
using RigOps.Api.Models;
using RigOps.Api.Repositories;
using RigOps.Api.DTOs;
using RigOps.Api.Services;

namespace RigOps.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WellsController : ControllerBase
{
    private readonly IWellRepository _wellRepository;

    public WellsController(IWellRepository wellRepository)
    {
        _wellRepository = wellRepository;
    }

    private static WellDto ToDto(Well well) => new()
    {
        Id = well.Id,
        Name = well.Name,
        Status = well.Status,
        CurrentDepth = well.CurrentDepth,
        CreatedAt = well.CreatedAt,
        RigId = well.RigId,
        RigName = well.Rig?.Name
    };

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WellDto>>> GetAll()
    {
        var wells = await _wellRepository.GetAllAsync();
        return Ok(wells.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WellDto>> GetById(int id)
    {
        var well = await _wellRepository.GetByIdAsync(id);
        if (well is null)
        {
            return NotFound();
        }
        return Ok(ToDto(well));
    }
    [HttpGet("{id}/telemetry")]
    public async Task<IActionResult> GetTelemetry(int id, [FromServices] ITelemetryServiceClient telemetryClient, int limit = 50)
    {
        var well = await _wellRepository.GetByIdAsync(id);
        if (well is null)
        {
            return NotFound();
        }

        var result = await telemetryClient.GetRecentReadingsAsync(id, limit);

        if (!result.Success)
        {
            return StatusCode(503, new
            {
                message = "Telemetry data is temporarily unavailable.",
                wellId = id
            });
        }

        return Content(result.RawJson!, "application/json");
    }

    [HttpPost]
    public async Task<ActionResult<Well>> Create(Well well)
    {
        var created = await _wellRepository.CreateAsync(well);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Well well)
    {
        if (id != well.Id)
        {
            return BadRequest("ID in URL does not match ID in request body.");
        }

        var updated = await _wellRepository.UpdateAsync(well);
        if (!updated)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _wellRepository.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }
}