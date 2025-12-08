using System;
using System.ComponentModel.DataAnnotations;

public record HealthDO
(
    [property: Key] string Id,
    string UserId,
    double? Height,                      // 身高 (cm)
    double? Weight,                      // 体重 (kg)
    int? BloodPressureSystolic,          // 收缩压
    int? BloodPressureDiastolic,         // 舒张压
    string? MedicalHistory,              // 病例/病史
    DateTime RecordDate,                 // 记录日期
    string? Notes,                       // 备注
    DateTime CreateTime,
    DateTime UpdateTime
);