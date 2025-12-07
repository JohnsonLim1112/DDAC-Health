using Microsoft.AspNetCore.Identity;
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
        HttpVO vo = LoginService.Register(reg.Username, reg.Password, reg.Password2, reg.SecurityPassword);
        return vo;
    }


    [HttpPost("login")]
    public HttpVO Login([FromBody] LoginVO dto)
    {
        HttpVO isValid = LoginService.ValidateLogin(dto.Username, dto.Password);
        return isValid;
    }

    [HttpPost("email")]
    public HttpVO Email([FromBody] EmailcheckVO email)
    {
        HttpVO isValid = LoginService.ValidateEmail(email.Username);
        return isValid;
    }

    [HttpPost("security")]
    public HttpVO Security([FromBody] SafeCheckVO scv)
    {
        HttpVO isValid = LoginService.ValidateSecurityPassword(scv.id, scv.SecurityPassword);
        return isValid;
    }

    [HttpPost("change")]
    public HttpVO Change([FromBody] ChangeVO cv)
    {
        HttpVO isValid = LoginService.ChangePassword(cv.id, cv.password);
        return isValid;
    }

    [HttpPost("delete")]
    public HttpVO Delete([FromBody] DeleteVO delete)
    {
        HttpVO isValid = LoginService.DeleteUser(delete.id);
        return isValid;
    }
}