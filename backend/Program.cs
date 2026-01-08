using Service;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DDAC Health Login API", Version = "v1" });
});

// HttpClientFactory（API Gateway）
builder.Services.AddHttpClient();
// scheduled task
builder.Services.AddHostedService<AppointmentReminderService>();

var app = builder.Build();

app.MapGet("/", () => "✅ DDAC Health API is running!");


app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DDAC Health API v1");
    c.RoutePrefix = "swagger";
});


app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();