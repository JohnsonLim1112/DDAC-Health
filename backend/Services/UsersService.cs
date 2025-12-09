using Mapper;

namespace Service
{
    public class UsersService
    {
        // admin check users
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

        // admin reset user's password
        public static string UpdateUser(string id, bool changepassword, bool changeSecurity, List<LoginDO> data)
        {
            string mes = "";
            if (data is List<LoginDO>)
            {
                foreach (var item in data)
                {
                    LoginDO originalUser = LoginMapper.SelectById(item.Id);
                    if (originalUser == null)
                        continue;
                    string newPassword = originalUser.Password;
                    string newSecurityPassword = originalUser.SecurityPassword;

                    if (changepassword && !string.IsNullOrEmpty(item.Password))
                    {
                        newPassword = Tools.Token(item.Password);
                    }

                    if (changeSecurity && !string.IsNullOrEmpty(item.SecurityPassword))
                    {
                        newSecurityPassword = Tools.Token(item.SecurityPassword);
                    }

                    var updatedUser = new LoginDO(
                        Id: item.Id,
                        Username: item.Username,
                        Password: newPassword,
                        SecurityPassword: newSecurityPassword,
                        Role: item.Role
                    );

                    LoginMapper.Update(updatedUser);
                }
                mes = "User updated";
            }
            return mes;
        }

        public static HttpVO DeleteUser(string id)
        {
            HttpVO admin = new HttpVO();
            LoginMapper.Delete(id);
            admin.success = true;
            admin.message = "User deleted";
            return admin;
        }

        // admin create users
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
