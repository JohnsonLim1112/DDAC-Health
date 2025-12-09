using System;
using System.ComponentModel.DataAnnotations;

public record HealthDO
(
    [property: Key] string Id,
    string UserId,
    double? Height,                     
    double? Weight,                    
    int? BloodPressureSystolic,         
    int? BloodPressureDiastolic,        
    string? MedicalHistory,              
    DateTime RecordDate,                
    string? Notes,                       
    DateTime CreateTime,
    DateTime UpdateTime
);