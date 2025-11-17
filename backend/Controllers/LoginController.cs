using Microsoft.AspNetCore.Mvc;
using backend;

namespace backend
{
    [ApiController]
    [Route("login")]
    public class LoginController : ControllerBase
    {
        private readonly LoginService loginService;

        public LoginController(LoginService service)
        {
            loginService = service;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] LoginDO logindo)
        {
            try
            {
                loginService.Register(logindo.Username, logindo.Password, logindo.Role);
                return Ok(true);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Register Error: " + ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDO dto)
        {
            try
            {
                bool isValid = loginService.ValidateLogin(dto.Username, dto.Password);
                return Ok(isValid);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Login Error: " + ex.Message);
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            var port = HttpContext.Connection.LocalPort;
            return Ok(new
            {
                message = "Login API 正常运行",
                time = DateTime.Now,
                port = port
            });
        }
    }
}