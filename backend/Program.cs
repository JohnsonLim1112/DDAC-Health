using backend; // 确保你的类都在 backend 命名空间下

var builder = WebApplication.CreateBuilder(args);

// ========== 1. 注册你的 LoginService（模拟模式）==========
builder.Services.AddSingleton<LoginService>(); // 关键！无参数构造函数
// =====================================================

// Add services to the container.
builder.Services.AddControllers();

// Swagger 配置
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "DDAC Health Login API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DDAC Health API v1");
        c.RoutePrefix = "swagger"; // 访问 http://localhost:5089/swagger
    });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("Login API 启动中...");
app.Run(); // 启动服务器