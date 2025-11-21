using Mapper;

namespace Service
{
    public class AdminService
    {
        public static HttpVO CheckUsers(String id)
        {
            LoginDO user = LoginMapper.SelectById(id);
            HttpVO admin = new HttpVO();
            if (user == null)
            {
                admin.success = false;
                admin.message = "User not found";
            }else if (user.Role.Equals("admin"))
            {
                admin.success = true;
                var Users = LoginMapper.GetAll();
                admin.data = Users;
            }else
            {
                admin.success = false;
                admin.message = "User is not admin";
            }
            return admin;
        }

        public static string UpdateUser(string id, List<LoginDO> data)
        {
            string mes = "";
            if (data is List<LoginDO>)
            {
                foreach (var item in data)
                {
                    LoginDO originalUser = LoginMapper.SelectById(item.Id);
                    if (originalUser.Password != item.Password)
                    {
                        string PasswordToken = Tools.Token(item.Password);
                        var LoginDO = new LoginDO(
                            Id: item.Id,
                            Username: item.Username,
                            Password: PasswordToken,
                            SecurityPassword: item.SecurityPassword,
                            Role: item.Role
                        );
                        LoginMapper.Update(LoginDO);
                    }
                    else
                    {
                        string SafePasswordToken = Tools.Token(item.SecurityPassword);
                        var LoginDO = new LoginDO(
                            Id: item.Id,
                            Username: item.Username,
                            Password: item.Password,
                            SecurityPassword: SafePasswordToken,
                            Role: item.Role
                        );
                        LoginMapper.Update(LoginDO);
                    }
                }
                mes = "User updated";
            }
            return mes;
        }

        public static HttpVO DeleteUser(String id)
        {
            HttpVO admin = new HttpVO();
            LoginMapper.Delete(id);
            admin.success = true;
            admin.message = "User deleted";
            return admin;
        }

        public static HttpVO CreateUser(CreateUserVO data)
        {
            HttpVO admin = new HttpVO();
            if (data != null)
            {
                string uuid = Guid.NewGuid().ToString();
                string PasswordToken = Tools.Token(data.Password);
                var loginDO = new LoginDO(
                    Id: uuid,
                    Username: data.Username,
                    Password: PasswordToken,
                    SecurityPassword: PasswordToken,
                    Role: data.role
                );
                LoginMapper.Insert(loginDO);
                admin.success = true;
                admin.message = "User added";
            }
            else
            {
                admin.success= false;
                admin.message = "User not added";
            }
            return admin;
        }
    }
}
