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
        // ✅ 数据库字段用下划线：create_time, update_time, price (不是 prices)
        string sql = $"INSERT INTO {TableName} (id, user_id, doctor_id, is_accept, illness_txt, medicine, price, status, create_time, update_time) VALUES (@id, @user_id, @doctor_id, @is_accept, @illness_txt, @medicine, @price,@comment, @status, @date, @start_time, @end_time)";
        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", book.Id);
        cmd.Parameters.AddWithValue("user_id", book.UserId);
        cmd.Parameters.AddWithValue("doctor_id", book.DoctorId);
        cmd.Parameters.AddWithValue("is_accept", book.IsAccept);
        cmd.Parameters.AddWithValue("illness_txt", book.IllnessTxt);
        cmd.Parameters.AddWithValue("medicine", book.Medicine);
        cmd.Parameters.AddWithValue("price", book.Price);
        cmd.Parameters.AddWithValue("cooment", book.Comment);
        cmd.Parameters.AddWithValue("status", book.Status);
        cmd.Parameters.AddWithValue("date", book.Date);
        cmd.Parameters.AddWithValue("start_time", book.StartTime);
        cmd.Parameters.AddWithValue("end_time", book.EndTime);

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
                reader.GetString(0),      // id
                reader.GetString(1),      // user_id
                reader.GetString(2),      // doctor_id
                reader.GetBoolean(3),     // is_accept
                reader.GetString(4),      // illness_txt
                reader.GetString(5),      // medicine
                reader.GetDouble(6),      // price
                reader.GetString(7),      // comment
                reader.GetString(8),      // status
                reader.GetDateTime(9),    // date
                reader.GetDateTime(10),    // start_time
                reader.GetDateTime(11)    // end_time
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
                reader.GetString(0),      // id
                reader.GetString(1),      // user_id
                reader.GetString(2),      // doctor_id
                reader.GetBoolean(3),     // is_accept
                reader.GetString(4),      // illness_txt
                reader.GetString(5),      // medicine
                reader.GetDouble(6),      // price
                reader.GetString(7),      // comment
                reader.GetString(8),      // status
                reader.GetDateTime(9),    // date
                reader.GetDateTime(10),    // start_time
                reader.GetDateTime(11)    // end_time
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
                reader.GetString(0),      // id
                reader.GetString(1),      // user_id
                reader.GetString(2),      // doctor_id
                reader.GetBoolean(3),     // is_accept
                reader.GetString(4),      // illness_txt
                reader.GetString(5),      // medicine
                reader.GetDouble(6),      // price
                reader.GetString(7),      // comment
                reader.GetString(8),      // status
                reader.GetDateTime(9),    // date
                reader.GetDateTime(10),    // start_time
                reader.GetDateTime(11)    // end_time
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
                reader.GetString(0),      // id
                reader.GetString(1),      // user_id
                reader.GetString(2),      // doctor_id
                reader.GetBoolean(3),     // is_accept
                reader.GetString(4),      // illness_txt
                reader.GetString(5),      // medicine
                reader.GetDouble(6),      // price
                reader.GetString(7),      // comment
                reader.GetString(8),      // status
                reader.GetDateTime(9),    // date
                reader.GetDateTime(10),    // start_time
                reader.GetDateTime(11)    // end_time
            ));
        }
        return list;
    }

    public static void Update(BookDO book)
    {
     
        string sql = $"UPDATE {TableName} SET user_id=@user_id, doctor_id=@doctor_id, is_accept=@is_accept, illness_txt=@illness_txt, medicine=@medicine, price=@price, status=@status, create_time=@create_time, update_time=@update_time WHERE id=@id";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("id", book.Id);
        cmd.Parameters.AddWithValue("user_id", book.UserId);
        cmd.Parameters.AddWithValue("doctor_id", book.DoctorId);
        cmd.Parameters.AddWithValue("is_accept", book.IsAccept);
        cmd.Parameters.AddWithValue("illness_txt", book.IllnessTxt);
        cmd.Parameters.AddWithValue("medicine", book.Medicine);
        cmd.Parameters.AddWithValue("price", book.Price);
        cmd.Parameters.AddWithValue("cooment", book.Comment);
        cmd.Parameters.AddWithValue("status", book.Status);
        cmd.Parameters.AddWithValue("date", book.Date);
        cmd.Parameters.AddWithValue("start_time", book.StartTime);
        cmd.Parameters.AddWithValue("end_time", book.EndTime);

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

    // 管理员：每月总数统计
    public static Dictionary<string, int> GetMonthlyAppointmentCount(int year)
    {
        var result = new Dictionary<string, int>();
        string sql = $@"SELECT 
                        TO_CHAR(end_time, 'YYYY-MM') as month,
                        COUNT(*) as count
                    FROM {TableName}
                    WHERE EXTRACT(YEAR FROM end_time) = @year
                    GROUP BY TO_CHAR(end_time, 'YYYY-MM')
                    ORDER BY month";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("year", year);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            result[reader.GetString(0)] = reader.GetInt32(1);
        }
        return result;
    }

    // 特定用户的月度统计
    public static Dictionary<string, int> GetUserMonthlyAppointmentCount(string userId, int year)
    {
        var result = new Dictionary<string, int>();
        string sql = $@"SELECT 
                        TO_CHAR(end_time, 'YYYY-MM') as month,
                        COUNT(*) as count
                    FROM {TableName}
                    WHERE user_id = @user_id 
                    AND EXTRACT(YEAR FROM end_time) = @year
                    GROUP BY TO_CHAR(end_time, 'YYYY-MM')
                    ORDER BY month";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("user_id", userId);
        cmd.Parameters.AddWithValue("year", year);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            result[reader.GetString(0)] = reader.GetInt32(1);
        }
        return result;
    }

    // 特定医生的月度统计
    public static Dictionary<string, int> GetDoctorMonthlyAppointmentCount(string doctorId, int year)
    {
        var result = new Dictionary<string, int>();
        string sql = $@"SELECT 
                        TO_CHAR(end_time, 'YYYY-MM') as month,
                        COUNT(*) as count
                    FROM {TableName}
                    WHERE doctor_id = @doctor_id 
                    AND EXTRACT(YEAR FROM end_time) = @year
                    GROUP BY TO_CHAR(end_time, 'YYYY-MM')
                    ORDER BY month";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("doctor_id", doctorId);
        cmd.Parameters.AddWithValue("year", year);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            result[reader.GetString(0)] = reader.GetInt32(1);
        }
        return result;
    }

    // 医生查看指定月份的所有预约详情
    public static List<BookDO> SelectByDoctorIdAndMonth(string doctorId, int year, int month)
    {
        var list = new List<BookDO>();
        string sql = $@"SELECT * FROM {TableName} 
                    WHERE doctor_id = @doctor_id 
                    AND EXTRACT(YEAR FROM end_time) = @year 
                    AND EXTRACT(MONTH FROM end_time) = @month
                    ORDER BY end_time DESC";

        using var conn = new NpgsqlConnection(_connectionString);
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("doctor_id", doctorId);
        cmd.Parameters.AddWithValue("year", year);
        cmd.Parameters.AddWithValue("month", month);

        conn.Open();
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            list.Add(new BookDO(
                reader.GetString(0),      // id
                reader.GetString(1),      // user_id
                reader.GetString(2),      // doctor_id
                reader.GetBoolean(3),     // is_accept
                reader.GetString(4),      // illness_txt
                reader.GetString(5),      // medicine
                reader.GetDouble(6),      // price
                reader.GetString(7),      // comment
                reader.GetString(8),      // status
                reader.GetDateTime(9),    // date
                reader.GetDateTime(10),    // start_time
                reader.GetDateTime(11)    // end_time
            ));
        }
        return list;
    }
}