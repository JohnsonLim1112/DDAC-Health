using System.ComponentModel.DataAnnotations;

public record UserInfoDO
(
    [property: Key] string UserId,      
    string Name,
    string Gender,
    int Age,
    string Address,
    string? Specialization,              // 医生专业
    int? ExperienceYears,                // 从业年数
    string? Bio                          // 个人简介
);