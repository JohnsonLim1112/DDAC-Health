public class RegisterVO
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string Password2 { get; set; }
    public string SecurityPassword { get; set; }
}

public class LoginVO
{
    public string Username { get; set; }
    public string Password { get; set; }
}

public class EmailcheckVO
{
    public string Username { get; set; }
}

public class SafeCheckVO
{
    public string id { get; set; }
    public string SecurityPassword { get; set; }
}

public class ChangeVO
{
    public string id { get; set; }
    public string password { get; set; }
}
public class DeleteVO
{
    public string id { get; set; }
}
public class AdminRequestVO
{
    public string id { get; set; }
}

public class  AdminUpdateUsersVO
{
    public String id { get; set; }
    public List<LoginDO>? Data { get; set; }
}
public class CreateUserVO
{
    public String Username { get; set; }
    public String Password { get; set; }
    public String role { get; set; }
}