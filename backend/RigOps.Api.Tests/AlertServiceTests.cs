using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using RigOps.Api.Data;
using RigOps.Api.Models;
using RigOps.Api.Services;
using Xunit;

namespace RigOps.Api.Tests;

public class AlertServiceTests
{
    private static RigOpsDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<RigOpsDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new RigOpsDbContext(options);
    }

    [Fact]
    public async Task TransitionStatusAsync_ValidForwardMove_UpdatesStatusAndReturnsSuccess()
    {
        // Arrange
        var context = CreateContext();
        var alert = new Alert
        {
            Severity = AlertSeverity.High,
            Signal = "pressure",
            AnomalyScore = 0.85,
            Status = AlertStatus.New,
            WellId = 1,
        };
        context.Alerts.Add(alert);
        await context.SaveChangesAsync();

        var mockNotificationClient = new Mock<INotificationClient>();
        mockNotificationClient
            .Setup(c => c.SendAsync(It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(new NotificationResult { Success = true });

        var logger = Mock.Of<ILogger<AlertService>>();
        var service = new AlertService(context, mockNotificationClient.Object, logger);

        // Act
        var result = await service.TransitionStatusAsync(alert.Id, AlertStatus.Acknowledged);

        // Assert
        Assert.True(result.Success);
        Assert.Equal(AlertStatus.Acknowledged, result.UpdatedAlert!.Status);
    }

    [Fact]
    public async Task TransitionStatusAsync_BackwardMove_FailsWithoutChangingStatus()
    {
        // Arrange
        var context = CreateContext();
        var alert = new Alert
        {
            Severity = AlertSeverity.High,
            Signal = "pressure",
            AnomalyScore = 0.85,
            Status = AlertStatus.Investigating,
            WellId = 1,
        };
        context.Alerts.Add(alert);
        await context.SaveChangesAsync();

        var mockNotificationClient = new Mock<INotificationClient>();
        var logger = Mock.Of<ILogger<AlertService>>();
        var service = new AlertService(context, mockNotificationClient.Object, logger);

        // Act
        var result = await service.TransitionStatusAsync(alert.Id, AlertStatus.New);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("Cannot move alert", result.ErrorMessage);
        mockNotificationClient.Verify(c => c.SendAsync(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task TransitionStatusAsync_AlertNotFound_ReturnsNotFoundError()
    {
        var context = CreateContext();
        var mockNotificationClient = new Mock<INotificationClient>();
        var logger = Mock.Of<ILogger<AlertService>>();
        var service = new AlertService(context, mockNotificationClient.Object, logger);

        var result = await service.TransitionStatusAsync(999, AlertStatus.Acknowledged);

        Assert.False(result.Success);
        Assert.Equal("Alert not found.", result.ErrorMessage);
    }

    [Fact]
    public async Task TransitionStatusAsync_NotificationFails_StatusStillPersists()
    {
        // This is the specific regression test for the real design decision
        // made in Day 4: a failed notification relay must not roll back or
        // fail an already-valid status transition.
        var context = CreateContext();
        var alert = new Alert
        {
            Severity = AlertSeverity.Low,
            Signal = "torque",
            AnomalyScore = 0.4,
            Status = AlertStatus.New,
            WellId = 2,
        };
        context.Alerts.Add(alert);
        await context.SaveChangesAsync();

        var mockNotificationClient = new Mock<INotificationClient>();
        mockNotificationClient
            .Setup(c => c.SendAsync(It.IsAny<int>(), It.IsAny<string>()))
            .ReturnsAsync(new NotificationResult { Success = false });

        var logger = Mock.Of<ILogger<AlertService>>();
        var service = new AlertService(context, mockNotificationClient.Object, logger);

        var result = await service.TransitionStatusAsync(alert.Id, AlertStatus.Acknowledged);

        Assert.True(result.Success);
        Assert.Equal(AlertStatus.Acknowledged, result.UpdatedAlert!.Status);
    }
}