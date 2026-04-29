using AdzenDooh.Api.DependencyInjection;
using Xabe.FFmpeg;

var builder = WebApplication.CreateBuilder(args);

//  Services Configuration
builder.Services.AddCoreServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
    
var app = builder.Build();


if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
FFmpeg.SetExecutablesPath("C:/ffmpeg/bin");


app.UseCors("AllowAngular");

app.UseAuthorization();

app.MapControllers();

app.Run();