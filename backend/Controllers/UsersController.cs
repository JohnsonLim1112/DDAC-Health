using Mapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace Controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : ControllerBase
    {
        // get users
        [HttpGet("get")]
        public HttpVO GetUsers([FromQuery] string adminId)
        {
            HttpVO users = UsersService.CheckUsers(adminId);
            return users;
        }
        // update users
        [HttpPost("update")]
        public HttpVO UpdateUser([FromBody] AdminUpdateUsersVO admin)
        {
            HttpVO user = new HttpVO();
            if (admin.Data != null)
            {
                string mes = UsersService.UpdateUser(admin.id, admin.Data);
                user.message = mes;
            }
            else
            {
                user.success = false;
                user.message = "No data";
            }
            return user;
        }
        // delete users
        [HttpPost("delete")]
        public HttpVO DeleteUser([FromBody] DeleteVO admindelete)
        {
            HttpVO user = UsersService.DeleteUser(admindelete.id);
            return user;
        }
        //create users
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
                return UsersService.CreateUser(admincreate);
            }
        }
    }
}
