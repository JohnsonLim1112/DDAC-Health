using Mapper;

namespace Service;



public static class LoginService
{
    private static HttpVO Registercheck(string username, string password, string password2, string SecurityPassword)
    {
        var users = LoginMapper.GetAll();
        HttpVO httpVO = new HttpVO();
        httpVO.success = true;
        foreach (var user in users)
        {
            if (user.Username == username)
            {
                httpVO.success = false;
                httpVO.message = "Username already exists";
                return httpVO;
            }
        }
        if (password != password2)
        {
            httpVO.success = false;
            httpVO.message = "Passwords do not match";
            return httpVO;
        }
        string pas = password.ToString();
        if (SecurityPassword.Equals(pas))
        {
            httpVO.success = false;
            httpVO.message = "security password cannot be the same as the Password";
        }
        return httpVO;
    }

    private static string Token(string Password)
    {

        byte[] PasswordBytes = System.Text.Encoding.UTF8.GetBytes(Password);
        byte[] HashBytes = System.Security.Cryptography.SHA256.Create().ComputeHash(PasswordBytes);
        string Hash = Convert.ToBase64String(HashBytes);

        return Hash;
    }

    //Service Funtion
    public static HttpVO Register(string username, string password, string password2, string SecurityPassword)
    {

        HttpVO httpvo = Registercheck(username, password, password2, SecurityPassword);
        
        if (httpvo.success == true)
        {
            string PasswordToken = Token(password);
            string SecurityPasswordToken = Token(SecurityPassword);
            string uuid = Guid.NewGuid().ToString();
            var loginDO = new LoginDO(
                Id: uuid,
                Username: username,
                Password: PasswordToken,
                SecurityPassword: SecurityPasswordToken,
                Role: "customer"
            );
            LoginMapper.Insert(loginDO);
            // check Object
            Console.WriteLine($"Successfully created the LoginDO object：");
            Console.WriteLine($"LoginDO.Id：{loginDO.Id}");
            Console.WriteLine($"LoginDO.Username：{loginDO.Username}");
            Console.WriteLine($"LoginDO.Role：{loginDO.Role}");
        }
        
        return httpvo;
    }

    public static HttpVO ValidateLogin(string username, string password)
    {
        String passwordToken = Token(password);
        var users = LoginMapper.GetAll();
        HttpVO httpVO = new HttpVO();
        httpVO.success = false;
        foreach (var user in users)
        {
            if (username == user.Username && passwordToken == user.Password)
            {
                httpVO.success = true;
                httpVO.message = "Login successful";
                httpVO.data = new
                {
                    LoginId = user.Id,
                    LoginRole = user.Role,
                };
                return httpVO;
            }
        }
        httpVO.message = "Invalid username or password";
        return httpVO;
    }

    public static HttpVO ValidateEmail(string email)
    {
        var users = LoginMapper.GetAll();
        HttpVO httpVO = new HttpVO();
        httpVO.success = false;
        foreach (var user in users)
        {
            if (email == user.Username)
            {
                httpVO.success = true;
                httpVO.data = new
                {
                    LoginId = user.Id,
                };
                return httpVO;
            }
        }
        httpVO.message = "Email does not exist";
        return httpVO;
    }
    public static HttpVO ValidateSecurityPassword(string id, string SecurityPassword)
    {
        string SecurityPasswordToken = Token(SecurityPassword);
        var user = LoginMapper.SelectById(id);
        HttpVO httpVO = new HttpVO();
        if (user.SecurityPassword.Equals(SecurityPasswordToken))
        {
            httpVO.success = true;
            httpVO.data = new
            {
                LoginId = user.Id,
            };
            return httpVO;
        }
        else
        {
            httpVO.success = false;
            httpVO.message = "Security password is incorrect";
        }
        return httpVO;
    }
    public  static HttpVO ChangePassword(string id, string password)
    {
        HttpVO httpVO = new HttpVO();
        string psToken = Token(password);
        var data = LoginMapper.SelectById(id);
        LoginDO loginDO = new LoginDO(
            Id: id,
            Username: data.Username,
            Password: psToken,
            SecurityPassword: data.SecurityPassword,
            Role: data.Role
        );
        LoginMapper.Update(loginDO);
        httpVO.success = true;
        return httpVO;
    }

    public static HttpVO DeleteUser(string id)
    {
        var user = LoginMapper.SelectById(id);
        HttpVO httpVO = new HttpVO();
        if (user == null)
        {
            httpVO.success = false;
            httpVO.message = "User does not exist";
            return httpVO;
        }
        else {
            LoginMapper.Delete(id);
            httpVO.success = true;
            return httpVO;
        }
    }
}