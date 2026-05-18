using AdzenDooh.Api.DependencyInjection;
using AdzenDooh.Api.Middleware; // 1. Make sure to import your handler namespace!
using Xabe.FFmpeg;

var builder = WebApplication.CreateBuilder(args);


// SERVICES CONFIGURATION (Dependency Injection)
builder.Services.AddCoreServices();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//  GLOBAL EXCEPTION  
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

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

/*
 ==========================================
 HTTP REQUEST PIPELINE CONFIGURATION (Middleware)
 ==========================================
*/


app.UseExceptionHandler();

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