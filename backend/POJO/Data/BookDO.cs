using System.ComponentModel.DataAnnotations;

public record BookDO(
    [property: Key] string Id,
    string UserId,
    string DoctorId,
    bool IsAccept,
    string IllnessTxt,
    string Medicine,
    double Price,
    string Status，
    DateTime CreatedTime,
    DateTime UpdatedTime
);