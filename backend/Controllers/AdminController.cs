using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controllers
{
    [ApiController]
    [Route("admin")]
    public class AdminController : ControllerBase
    {
        [HttpGet("users")]
        public HttpVO GetUsers([FromBody] AdminRequestVO admin)
        {
            HttpVO users = AdminService.CheckUsers(admin.id);
            return users;
        }
        [HttpPost("update")]
        public HttpVO UpdateUser([FromBody] AdminUpdateUsersVO admin)
        {
            HttpVO user = new HttpVO();
            if (admin.Data != null)
            {
                string mes = AdminService.UpdateUser(admin.id, admin.Data);
                user.message = mes;
            }
            else
            {
                user.success = false;
                user.message = "No data";
            }
            return user;
        }

        [HttpPost("delete")]
        public HttpVO DeleteUser([FromBody] DeleteVO admindelete)
        {
            HttpVO user = AdminService.DeleteUser(admindelete.id);
            return user;

        }

        [HttpPost("create")]
        public HttpVO CreateUser([FromBody] CreateUserVO admincreate)
        {
            HttpVO user = AdminService.CreateUser(admincreate);
            return user;

        }
    }
}
