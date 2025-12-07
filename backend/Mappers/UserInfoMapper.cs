using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;

namespace Mapper;

public static class UserInfoMapper
{
    private const string TableName = "\"UserInfo\"";
    private static readonly string _connectionString;

    static UserInfoMapper()
    {
        var basePath = AppContext.BaseDirectory;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _connectionString = configuration.GetConnectionString("PostgresConnection")
            ?? throw new ArgumentNullException("please check appsettings.json");
    }

    public static void Insert(UserInfoDO userInfo)
    {
        // ✅ UserId 大写，其他小写
        string sql = $@"INSERT INTO {TableName} 
            (""UserId"", name, gender, age, address, specialization, experience_years, bio) 
            VALUES (@userid, @name, @gender, @age, @address, @specialization, @experience_years, @bio)";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("userid", userInfo.UserId);
        cmd.Parameters.AddWithValue("name", userInfo.Name);
        cmd.Parameters.AddWithValue("gender", userInfo.Gender);
        cmd.Parameters.AddWithValue("age", userInfo.Age);
        cmd.Parameters.AddWithValue("address", userInfo.Address);
        cmd.Parameters.AddWithValue("specialization", (object?)userInfo.Specialization ?? DBNull.Value);
        cmd.Parameters.AddWithValue("experience_years", (object?)userInfo.ExperienceYears ?? DBNull.Value);
        cmd.Parameters.AddWithValue("bio", (object?)userInfo.Bio ?? DBNull.Value);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static List<UserInfoDO> GetAll()
    {
        var list = new List<UserInfoDO>();
        string sql = $"SELECT * FROM {TableName}";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new UserInfoDO
            (
                UserId: reader.GetString(0),                            // UserId
                Name: reader.GetString(1),                              // name
                Gender: reader.GetString(2),                            // gender
                Age: reader.GetInt32(3),                                // age
                Address: reader.GetString(4),                           // address
                Specialization: reader.IsDBNull(5) ? null : reader.GetString(5),    // specialization
                ExperienceYears: reader.IsDBNull(6) ? null : reader.GetInt32(6),    // experience_years
                Bio: reader.IsDBNull(7) ? null : reader.GetString(7)    // bio
            ));
        }
        return list;
    }

    public static UserInfoDO? SelectByUserId(string userId)
    {
        string sql = $"SELECT * FROM {TableName} WHERE \"UserId\" = @userid";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("userid", userId);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new UserInfoDO
            (
                UserId: reader.GetString(0),
                Name: reader.GetString(1),
                Gender: reader.GetString(2),
                Age: reader.GetInt32(3),
                Address: reader.GetString(4),
                Specialization: reader.IsDBNull(5) ? null : reader.GetString(5),
                ExperienceYears: reader.IsDBNull(6) ? null : reader.GetInt32(6),
                Bio: reader.IsDBNull(7) ? null : reader.GetString(7)
            );
        }
        return null;
    }

    public static List<UserInfoDO> GetAllDoctors()
    {
        var list = new List<UserInfoDO>();
        string sql = $"SELECT * FROM {TableName} WHERE specialization IS NOT NULL";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new UserInfoDO
            (
                UserId: reader.GetString(0),
                Name: reader.GetString(1),
                Gender: reader.GetString(2),
                Age: reader.GetInt32(3),
                Address: reader.GetString(4),
                Specialization: reader.IsDBNull(5) ? null : reader.GetString(5),
                ExperienceYears: reader.IsDBNull(6) ? null : reader.GetInt32(6),
                Bio: reader.IsDBNull(7) ? null : reader.GetString(7)
            ));
        }
        return list;
    }

    public static void Update(UserInfoDO userInfo)
    {
        // ✅ UserId 大写，其他小写
        string sql = $@"UPDATE {TableName} 
            SET name=@name, gender=@gender, age=@age, 
                address=@address, specialization=@specialization, 
                experience_years=@experience_years, bio=@bio 
            WHERE ""UserId""=@userid";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("userid", userInfo.UserId);
        cmd.Parameters.AddWithValue("name", userInfo.Name);
        cmd.Parameters.AddWithValue("gender", userInfo.Gender);
        cmd.Parameters.AddWithValue("age", userInfo.Age);
        cmd.Parameters.AddWithValue("address", userInfo.Address);
        cmd.Parameters.AddWithValue("specialization", (object?)userInfo.Specialization ?? DBNull.Value);
        cmd.Parameters.AddWithValue("experience_years", (object?)userInfo.ExperienceYears ?? DBNull.Value);
        cmd.Parameters.AddWithValue("bio", (object?)userInfo.Bio ?? DBNull.Value);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static void Delete(string userId)
    {
        string sql = $"DELETE FROM {TableName} WHERE \"UserId\"=@userid";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("userid", userId);

        conn.Open();
        cmd.ExecuteNonQuery();
    }
}