using Microsoft.AspNetCore.Mvc;
using RigOps.Api.Models;
using RigOps.Api.Services;
using Microsoft.EntityFrameworkCore;
namespace RigOps.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    public class TransitionRequest
    {
        public AlertStatus NewStatus { get; set; }
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll([FromServices] RigOps.Api.Data.RigOpsDbContext context)
    {
        var alerts = await context.Alerts
            .Select(a => new
            {
                id = a.Id,
                severity = a.Severity,
                signal = a.Signal,
                anomalyScore = a.AnomalyScore,
                status = a.Status,
                detectedAt = a.DetectedAt,
                wellId = a.WellId
            })
            .ToListAsync();

        return Ok(alerts);
    }

    [HttpPost("{id}/transition")]
    public async Task<IActionResult> Transition(int id, TransitionRequest request)
    {
        var result = await _alertService.TransitionStatusAsync(id, request.NewStatus);

        if (!result.Success)
        {
            if (result.ErrorMessage == "Alert not found.")
            {
                return NotFound(new { message = result.ErrorMessage });
            }
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(new
        {
            id = result.UpdatedAlert!.Id,
            status = result.UpdatedAlert.Status,
            severity = result.UpdatedAlert.Severity,
            signal = result.UpdatedAlert.Signal
        });
    }
}