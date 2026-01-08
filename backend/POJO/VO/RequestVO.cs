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

public class AdminUpdateUsersVO
{
    public string id { get; set; }
    public List<LoginDO>? Data { get; set; }
    public Boolean updatePassword { get; set; }
    public Boolean updateSecurityPassword { get; set; }
}

public class CreateUserVO
{
    public string AdminId { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string role { get; set; }
}

public class CreateBookVO
{
    public string UserId { get; set; }
    public string DoctorId { get; set; }
    public Boolean IsAccept { get; set; }
    public string IllnessTxt { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

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
    public string? Specialization { get; set; }
    public int? ExperienceYears { get; set; }
    public string? Bio { get; set; }
    public string Picture { get; set; }
}

public class getInfoVO
{
    public string UserId { get; set; }
}

//for health
public class CreateHealthVO
{
    public string UserId { get; set; }
    public double? Height { get; set; }
    public double? Weight { get; set; }
    public int? BloodPressureSystolic { get; set; }
    public int? BloodPressureDiastolic { get; set; }
    public string? MedicalHistory { get; set; }
    public DateTime RecordDate { get; set; }
    public string? Notes { get; set; }
}

public class HealthFilterVO
{
    public string UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}