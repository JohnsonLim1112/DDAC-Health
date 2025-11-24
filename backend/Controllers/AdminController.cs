using Mapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controllers
{
    [ApiController]
    [Route("admin")]
    public class AdminController : ControllerBase
    {
        [HttpGet("users")]
        public HttpVO GetUsers([FromQuery] string adminId)
        {
            HttpVO users = AdminService.CheckUsers(adminId);
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
            LoginDO user = LoginMapper.SelectById(admincreate.AdminId);
            HttpVO res = new HttpVO();
            if (user != null && user.Role != "admin")
            {
                res.success = false;
                res.message = "No permission to perform the operation.";
                return res;
            }
            else
            {
                return AdminService.CreateUser(admincreate);
            }

        }
    }
}
