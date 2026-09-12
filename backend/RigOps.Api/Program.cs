using Microsoft.EntityFrameworkCore;
using RigOps.Api.Repositories;
using RigOps.Api.Data;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<RigOpsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("RigOpsDb")));
builder.Services.AddScoped<IWellRepository, WellRepository>();
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

app.UseAuthorization();

app.MapControllers();

app.Run();
