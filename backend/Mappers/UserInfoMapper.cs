using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;

namespace Mapper;

public static class UserInfoMapper
{
    private const string TableName = "user_info";
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
        string sql = $"INSERT INTO {TableName} (id, user_id, name, gender, age, address) VALUES (@id, @user_id, @name, @gender, @age, @address)";
        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        // 直接传值，空值自动映射为数据库 NULL
        cmd.Parameters.AddWithValue("id", userInfo.Id);
        cmd.Parameters.AddWithValue("user_id", userInfo.UserId);
        cmd.Parameters.AddWithValue("name", userInfo.Name);
        cmd.Parameters.AddWithValue("gender", userInfo.Gender);
        cmd.Parameters.AddWithValue("age", userInfo.Age);
        cmd.Parameters.AddWithValue("address", userInfo.Address);

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
            // 直接读取值，无任何空值判断
            list.Add(new UserInfoDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt32(4),
                reader.GetString(5)
            ));
        }
        return list;
    }

    public static UserInfoDO? SelectById(string id)
    {
        string sql = $"SELECT * FROM {TableName} WHERE id = @id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new UserInfoDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt32(4),
                reader.GetString(5)
            );
        }
        return null;
    }

    // 根据用户ID查询用户信息
    public static UserInfoDO? SelectByUserId(string userId)
    {
        string sql = $"SELECT * FROM {TableName} WHERE user_id = @user_id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new UserInfoDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetInt32(4),
                reader.GetString(5)
            );
        }
        return null;
    }

    public static void Update(UserInfoDO userInfo)
    {
        string sql = $"UPDATE {TableName} SET user_id=@user_id, name=@name, gender=@gender, age=@age, address=@address WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", userInfo.Id);
        cmd.Parameters.AddWithValue("user_id", userInfo.UserId);
        cmd.Parameters.AddWithValue("name", userInfo.Name);
        cmd.Parameters.AddWithValue("gender", userInfo.Gender);
        cmd.Parameters.AddWithValue("age", userInfo.Age);
        cmd.Parameters.AddWithValue("address", userInfo.Address);

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
}