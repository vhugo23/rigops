using Microsoft.AspNetCore.Mvc;
using RigOps.Api.Models;
using RigOps.Api.Services;

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