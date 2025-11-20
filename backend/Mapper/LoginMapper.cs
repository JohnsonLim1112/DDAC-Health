using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;

namespace Mapper;

public static class LoginMapper
{
    private const string TableName = "login";
    private static readonly string _connectionString;

    static LoginMapper()
    {
        var basePath = AppContext.BaseDirectory;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath) 
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _connectionString = configuration.GetConnectionString("PostgresConnection")
            ?? throw new ArgumentNullException("please check appsettings.json");
    }

    public static void Insert(LoginDO login)
    {
        string sql = $"INSERT INTO {TableName} (username, password, role) VALUES (@username, @password, @role)";
        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("username", login.Username);
        cmd.Parameters.AddWithValue("password", login.Password);
        cmd.Parameters.AddWithValue("role", login.Role);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static List<LoginDO> GetAll()
    {
        var list = new List<LoginDO>();
        string sql = $"SELECT * FROM {TableName}";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new LoginDO
            (
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3)
            ));
        }
        return list;
    }

    public static LoginDO? SelectById(int id)
    {
        string sql = $"SELECT id, username, password, role FROM {TableName} WHERE id = @id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new LoginDO
            (
                reader.GetInt32(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3)
            );
        }
        return null;
    }

    public static void Update(LoginDO login)
    {
        string sql = $"UPDATE {TableName} SET username=@username, password=@password, role=@role WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", login.Id);
        cmd.Parameters.AddWithValue("username", login.Username);
        cmd.Parameters.AddWithValue("password", login.Password);
        cmd.Parameters.AddWithValue("role", login.Role);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static void Delete(int id)
    {
        string sql = $"DELETE FROM {TableName} WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        cmd.ExecuteNonQuery();
    }
}