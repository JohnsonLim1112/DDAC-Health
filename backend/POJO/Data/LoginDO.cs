using System.ComponentModel.DataAnnotations;

public record LoginDO
(
    [property: Key] string Id,               
    string Username,
    string Password,
    string SecurityPassword,
    string Role
);

