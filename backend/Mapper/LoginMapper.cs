//using Npgsql;
//using System;
//using System.Collections.Generic;

//namespace backend
//{
//    public class LoginMapper
//    {
//        private const string TableName = "login";

//        private readonly string _connectionString;

//        public LoginMapper(string connectionString)
//        {
//            _connectionString = connectionString;
//        }

//        // CREATE
//        public void Insert(LoginDO login)
//        {
//            string sql = $"INSERT INTO {TableName} (username, password, role) VALUES (@username, @password, @role)";
//            using var conn = new NpgsqlConnection(_connectionString);
//            using var cmd = new NpgsqlCommand(sql, conn);

//            cmd.Parameters.AddWithValue("username", login.Username);
//            cmd.Parameters.AddWithValue("password", login.Password);
//            cmd.Parameters.AddWithValue("role", login.Role);

//            conn.Open();
//            cmd.ExecuteNonQuery();
//        }

//        // READ ALL
//        public List<LoginDO> GetAll()
//        {
//            var list = new List<LoginDO>();
//            string sql = $"SELECT id, username, password, role FROM {TableName}";

//            using var conn = new NpgsqlConnection(_connectionString);
//            using var cmd = new NpgsqlCommand(sql, conn);

//            conn.Open();
//            using var reader = cmd.ExecuteReader();
//            while (reader.Read())
//            {
//                list.Add(new LoginDO
//                {
//                    Id = reader.GetInt32(0),
//                    Username = reader.GetString(1),
//                    Password = reader.GetString(2),
//                    Role = reader.GetString(3)
//                });
//            }
//            return list;
//        }

//        // READ BY ID
//        public LoginDO? SelectById(int id)
//        {
//            string sql = $"SELECT id, username, password, role FROM {TableName} WHERE id = @id";

//            using var conn = new NpgsqlConnection(_connectionString);
//            using var cmd = new NpgsqlCommand(sql, conn);
//            cmd.Parameters.AddWithValue("id", id);

//            conn.Open();
//            using var reader = cmd.ExecuteReader();
//            if (reader.Read())
//            {
//                return new LoginDO
//                {
//                    Id = reader.GetInt32(0),
//                    Username = reader.GetString(1),
//                    Password = reader.GetString(2),
//                    Role = reader.GetString(3)
//                };
//            }
//            return null;
//        }

//        // UPDATE
//        public void Update(LoginDO login)
//        {
//            string sql = $"UPDATE {TableName} SET username=@username, password=@password, role=@role WHERE id=@id";

//            using var conn = new NpgsqlConnection(_connectionString);
//            using var cmd = new NpgsqlCommand(sql, conn);

//            cmd.Parameters.AddWithValue("id", login.Id);
//            cmd.Parameters.AddWithValue("username", login.Username);
//            cmd.Parameters.AddWithValue("password", login.Password);
//            cmd.Parameters.AddWithValue("role", login.Role);

//            conn.Open();
//            cmd.ExecuteNonQuery();
//        }

//        // DELETE
//        public void Delete(int id)
//        {
//            string sql = $"DELETE FROM {TableName} WHERE id=@id";

//            using var conn = new NpgsqlConnection(_connectionString);
//            using var cmd = new NpgsqlCommand(sql, conn);

//            cmd.Parameters.AddWithValue("id", id);

//            conn.Open();
//            cmd.ExecuteNonQuery();
//        }
//    }
//}
