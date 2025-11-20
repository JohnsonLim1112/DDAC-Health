using System.ComponentModel.DataAnnotations;

public record LoginDO
(
    [property: Key] int Id,               
    string Username,
    string Password,
    string Role
);

