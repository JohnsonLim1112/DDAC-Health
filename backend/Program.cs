var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger - 注册服务
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DDAC Health Login API", Version = "v1" });
});

var app = builder.Build();

// 🔥 关键：监听所有网络接口（AWS EB 要求）
app.Urls.Add("http://0.0.0.0:5000");

// 根路径用于健康检查
app.MapGet("/", () => "✅ DDAC Health API is running! Environment: " + app.Environment.EnvironmentName);

// ✅ 强制启用 Swagger（所有环境，包括 Production）
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "DDAC Health API v1");
    c.RoutePrefix = "swagger"; // 访问路径: /swagger
});

// 中间件顺序很重要
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("Login API start...");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
Console.WriteLine("Swagger enabled: true (forced in code)");

app.Run();