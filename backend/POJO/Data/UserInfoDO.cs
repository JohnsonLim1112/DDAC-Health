using System.ComponentModel.DataAnnotations;

public record UserInfoDO
(
    [property: Key] string UserId,      
    string Name,
    string Gender,
    int Age,
    string Address,
    string? Specialization,            
    int? ExperienceYears,                
    string? Bio, 
    string Picture
);