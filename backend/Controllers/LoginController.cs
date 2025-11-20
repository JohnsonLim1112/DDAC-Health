using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controller;

[ApiController]
[Route("User")]
public class LoginController : ControllerBase
{

    [HttpPost("register")]
    public HttpVO Register([FromBody] RegisterVO reg)
    {
        HttpVO vo= LoginService.Register(reg.Username,reg.Password,reg.Password2);
        return vo;
    }


    [HttpPost("login")]
    public HttpVO Login([FromBody] LoginVO dto)
    {
        HttpVO isValid = LoginService.ValidateLogin(dto.Username, dto.Password);
        return isValid;
    }
}