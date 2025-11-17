using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controller;

[ApiController]
[Route("login")]
public class LoginController : ControllerBase
{

    [HttpPost("register")]
    public IActionResult Register([FromBody] LoginDO logindo)
    {
        try
        {
            LoginService.Register(logindo.Username, logindo.Password, logindo.Role);
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
            bool isValid = LoginService.ValidateLogin(dto.Username, dto.Password);
            return Ok(isValid);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Login Error: " + ex.Message);
            return BadRequest(ex.Message);
        }
    }
}