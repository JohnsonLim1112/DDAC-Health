using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;

namespace Mapper;

public static class HealthMapper
{
    private const string TableName = "health";
    private static readonly string _connectionString;

    static HealthMapper()
    {
        var basePath = AppContext.BaseDirectory;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _connectionString = configuration.GetConnectionString("PostgresConnection")
            ?? throw new ArgumentNullException("please check appsettings.json");
    }

    public static void Insert(HealthDO health)
    {
        string sql = $@"INSERT INTO {TableName} 
            (id, user_id, height, weight, blood_pressure_systolic, blood_pressure_diastolic, 
             medical_history, record_date, notes, create_time, update_time) 
            VALUES (@id, @user_id, @height, @weight, @systolic, @diastolic, 
                    @medical_history, @record_date, @notes, @create_time, @update_time)";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", health.Id);
        cmd.Parameters.AddWithValue("user_id", health.UserId);
        cmd.Parameters.AddWithValue("height", (object?)health.Height ?? DBNull.Value);
        cmd.Parameters.AddWithValue("weight", (object?)health.Weight ?? DBNull.Value);
        cmd.Parameters.AddWithValue("systolic", (object?)health.BloodPressureSystolic ?? DBNull.Value);
        cmd.Parameters.AddWithValue("diastolic", (object?)health.BloodPressureDiastolic ?? DBNull.Value);
        cmd.Parameters.AddWithValue("medical_history", (object?)health.MedicalHistory ?? DBNull.Value);
        cmd.Parameters.AddWithValue("record_date", health.RecordDate.Date);
        cmd.Parameters.AddWithValue("notes", (object?)health.Notes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("create_time", health.CreateTime);
        cmd.Parameters.AddWithValue("update_time", health.UpdateTime);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static HealthDO? SelectById(string id)
    {
        string sql = $"SELECT * FROM {TableName} WHERE id = @id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return MapToHealthDO(reader);
        }
        return null;
    }

    
    public static HealthDO? SelectByUserIdAndDate(string userId, DateTime date)
    {
        string sql = $"SELECT * FROM {TableName} WHERE user_id = @user_id AND record_date = @record_date";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);
        cmd.Parameters.AddWithValue("record_date", date.Date);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return MapToHealthDO(reader);
        }
        return null;
    }


    public static List<HealthDO> SelectByUserId(string userId)
    {
        var list = new List<HealthDO>();
        string sql = $"SELECT * FROM {TableName} WHERE user_id = @user_id ORDER BY record_date DESC";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(MapToHealthDO(reader));
        }
        return list;
    }


    public static List<HealthDO> SelectByUserIdAndDateRange(string userId, DateTime startDate, DateTime endDate)
    {
        var list = new List<HealthDO>();
        string sql = $@"SELECT * FROM {TableName} 
                        WHERE user_id = @user_id 
                        AND record_date >= @start_date 
                        AND record_date <= @end_date 
                        ORDER BY record_date ASC";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);
        cmd.Parameters.AddWithValue("start_date", startDate.Date);
        cmd.Parameters.AddWithValue("end_date", endDate.Date);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(MapToHealthDO(reader));
        }
        return list;
    }

    public static void Update(HealthDO health)
    {
        string sql = $@"UPDATE {TableName} SET 
            user_id=@user_id, height=@height, weight=@weight, 
            blood_pressure_systolic=@systolic, blood_pressure_diastolic=@diastolic, 
            medical_history=@medical_history, record_date=@record_date, 
            notes=@notes, update_time=@update_time 
            WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", health.Id);
        cmd.Parameters.AddWithValue("user_id", health.UserId);
        cmd.Parameters.AddWithValue("height", (object?)health.Height ?? DBNull.Value);
        cmd.Parameters.AddWithValue("weight", (object?)health.Weight ?? DBNull.Value);
        cmd.Parameters.AddWithValue("systolic", (object?)health.BloodPressureSystolic ?? DBNull.Value);
        cmd.Parameters.AddWithValue("diastolic", (object?)health.BloodPressureDiastolic ?? DBNull.Value);
        cmd.Parameters.AddWithValue("medical_history", (object?)health.MedicalHistory ?? DBNull.Value);
        cmd.Parameters.AddWithValue("record_date", health.RecordDate.Date);
        cmd.Parameters.AddWithValue("notes", (object?)health.Notes ?? DBNull.Value);
        cmd.Parameters.AddWithValue("update_time", health.UpdateTime);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static void Delete(string id)
    {
        string sql = $"DELETE FROM {TableName} WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

  
    private static HealthDO MapToHealthDO(NpgsqlDataReader reader)
    {
        return new HealthDO(
            Id: reader.GetString(0),
            UserId: reader.GetString(1),
            Height: reader.IsDBNull(2) ? null : reader.GetDouble(2),
            Weight: reader.IsDBNull(3) ? null : reader.GetDouble(3),
            BloodPressureSystolic: reader.IsDBNull(4) ? null : reader.GetInt32(4),
            BloodPressureDiastolic: reader.IsDBNull(5) ? null : reader.GetInt32(5),
            MedicalHistory: reader.IsDBNull(6) ? null : reader.GetString(6),
            RecordDate: reader.GetDateTime(7),
            Notes: reader.IsDBNull(8) ? null : reader.GetString(8),
            CreateTime: reader.GetDateTime(9),
            UpdateTime: reader.GetDateTime(10)
        );
    }
}