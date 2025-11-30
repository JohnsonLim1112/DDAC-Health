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

public class  AdminUpdateUsersVO
{
    public string id { get; set; }
    public List<LoginDO>? Data { get; set; }
}

public class CreateUserVO
{
    public string AdminId { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string role { get; set; }
}

public class  CreateBookVO
{
    public string UserId { get; set; }
    public string DoctorId { get; set; }
    public Boolean IsAccept {  get; set; }
    public string IllnessTxt { get; set; }
}

public class UsercheckVO
{
    public string UserId { get; set; }
}

public class DoctorcheckVO
{
    public string DoctorId { get; set; }
}

public class CreateInfoVO
{
    public string UserId { get; set; }
    public string Name { get; set; }
    public string Gender { get; set; }
    public int Age { get; set; }
    public string Address { get; set; }
}

public class getInfoVO
{
    public string UserId { get; set; }
}