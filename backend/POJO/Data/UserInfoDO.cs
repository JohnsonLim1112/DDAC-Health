
using System.ComponentModel.DataAnnotations;

public record UserInfoDO
(
    [property: Key] string Id,
    string UserId,
    string Name,
    string Gender,
    int Age,
    string Address
    );
