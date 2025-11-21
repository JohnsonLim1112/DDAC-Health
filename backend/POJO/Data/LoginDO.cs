using System.ComponentModel.DataAnnotations;

public record LoginDO
(
    [property: Key] String Id,               
    string Username,
    string Password,
    string SecurityPassword,
    string Role
);

