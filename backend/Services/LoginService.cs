using Mapper;
using System.Linq;


namespace Service;

public static class LoginService
{
    public static void Register(string username, string password, string role = "customer")
    {
        var login = new LoginDO
        {
            Username = username,
            Password = password,
            Role = role
        };


        LoginMapper.Insert(login);
    }

    public static bool ValidateLogin(string username, string password)
    {
        var users = LoginMapper.GetAll();
        var user = users.FirstOrDefault(u => u.Username == username);
        return user != null && user.Password == password;
    }
}