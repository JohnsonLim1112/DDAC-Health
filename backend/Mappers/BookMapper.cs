using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;

namespace Mapper;

public static class BookMapper
{
    private const string TableName = "book";
    private static readonly string _connectionString;

    static BookMapper()
    {
        var basePath = AppContext.BaseDirectory;
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .Build();

        _connectionString = configuration.GetConnectionString("PostgresConnection")
            ?? throw new ArgumentNullException("please check appsettings.json");
    }

    public static void Insert(BookDO book)
    {
        string sql = $"INSERT INTO {TableName} (id, user_id, doctor_id, is_accept, illness_txt, medicine, prices, status, create_time, update_time) VALUES (@id, @user_id, @doctor_id, @is_accept, @illness_txt, @medicine, @prices, @status, @create_time, @update_time)";
        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", book.Id);
        cmd.Parameters.AddWithValue("user_id", book.UserId);
        cmd.Parameters.AddWithValue("doctor_id", book.DoctorId);
        cmd.Parameters.AddWithValue("is_accept", book.IsAccept);
        cmd.Parameters.AddWithValue("illness_txt", book.IllnessTxt);
        cmd.Parameters.AddWithValue("medicine", book.Medicine);
        cmd.Parameters.AddWithValue("prices", book.Price);
        cmd.Parameters.AddWithValue("status", book.Status);
        cmd.Parameters.AddWithValue("create_time", book.CreateTime);
        cmd.Parameters.AddWithValue("update_time", book.UpdateTime);

        conn.Open();
        cmd.ExecuteNonQuery();
    }

    public static List<BookDO> GetAll()
    {
        var list = new List<BookDO>();
        string sql = $"SELECT * FROM {TableName}";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new BookDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetBoolean(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetDouble(6),
                reader.GetString(7),
                reader.GetDateTime(8),
                reader.GetDateTime(9)
            ));
        }
        return list;
    }

    public static BookDO? SelectById(string id)
    {
        string sql = $"SELECT * FROM {TableName} WHERE id = @id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", id);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        if (reader.Read())
        {
            return new BookDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetBoolean(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetDouble(6),
                reader.GetString(7),
                reader.GetDateTime(8),
                reader.GetDateTime(9)
            );
        }
        return null;
    }

    // 根据用户ID查询预约记录
    public static List<BookDO> SelectByUserId(string userId)
    {
        var list = new List<BookDO>();
        string sql = $"SELECT * FROM {TableName} WHERE user_id = @user_id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new BookDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetBoolean(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetDouble(6),
                reader.GetString(7),
                reader.GetDateTime(8),
                reader.GetDateTime(9)
            ));
        }
        return list;
    }

    // 根据医生ID查询预约记录
    public static List<BookDO> SelectByDoctorId(string doctorId)
    {
        var list = new List<BookDO>();
        string sql = $"SELECT * FROM {TableName} WHERE doctor_id = @doctor_id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("doctor_id", doctorId);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new BookDO
            (
                reader.GetString(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetBoolean(3),
                reader.GetString(4),
                reader.GetString(5),
                reader.GetDouble(6),
                reader.GetString(7),
                reader.GetDateTime(8),
                reader.GetDateTime(9)
            ));
        }
        return list;
    }

    public static void Update(BookDO book)
    {
        string sql = $"UPDATE {TableName} SET user_id=@user_id, doctor_id=@doctor_id, is_accept=@is_accept, illness_txt=@illness_txt, medicine=@medicine, prices=@prices, status=@status, create_time=@create_time, update_time=@update_time WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", book.Id);
        cmd.Parameters.AddWithValue("user_id", book.UserId);
        cmd.Parameters.AddWithValue("doctor_id", book.DoctorId);
        cmd.Parameters.AddWithValue("is_accept", book.IsAccept);
        cmd.Parameters.AddWithValue("illness_txt", book.IllnessTxt);
        cmd.Parameters.AddWithValue("medicine", book.Medicine);
        cmd.Parameters.AddWithValue("prices", book.Price);
        cmd.Parameters.AddWithValue("status", book.Status);
        cmd.Parameters.AddWithValue("create_time", book.CreateTime);
        cmd.Parameters.AddWithValue("update_time", book.UpdateTime);

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