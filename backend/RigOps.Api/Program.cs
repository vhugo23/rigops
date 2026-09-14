using Microsoft.EntityFrameworkCore;
using RigOps.Api.Repositories;
using RigOps.Api.Data;
using RigOps.Api.Services;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://rigops-gamma.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<RigOpsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("RigOpsDb")));
builder.Services.AddScoped<IWellRepository, WellRepository>();

builder.Services.AddHttpClient("TelemetryService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["TelemetryServiceUrl"] ?? "http://localhost:3001");
});
builder.Services.AddHttpClient("AiService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiServiceUrl"] ?? "http://localhost:8001");
});
builder.Services.AddScoped<IAnomalyServiceClient, AnomalyServiceClient>();
builder.Services.AddScoped<ITelemetryServiceClient, TelemetryServiceClient>();

builder.Services.AddHttpClient("NotificationService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["NotificationServiceUrl"] ?? "http://localhost:3002");
});
builder.Services.AddScoped<INotificationClient, NotificationClient>();
builder.Services.AddScoped<IAlertService, AlertService>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
