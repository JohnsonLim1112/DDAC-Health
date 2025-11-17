namespace backend
{
    public class LoginService
    {
        // 暂时移除 mapper 依赖
        // private readonly LoginMapper _mapper;

        public LoginService()
        {
            // _mapper = mapper;
        }

        public void Register(string username, string password, string role = "customer")
        {
            // ========== 模拟注册 ==========
            Console.WriteLine($"[模拟注册成功] 用户: {username}, 角色: {role}");
            // =============================

            // 以后恢复真实数据库：
            /*
            var login = new LoginDO
            {
                Username = username,
                Password = password,
                Role = role
            };
            _mapper.Insert(login);
            */
        }

        public bool ValidateLogin(string username, string password)
        {
            // ========== 模拟登录 ==========
            Console.WriteLine($"[模拟登录] 用户: {username}");
            return username == "admin" && password == "123";
            // =============================

            // 以后恢复真实数据库：
            /*
            var users = _mapper.GetAll();
            var user = users.FirstOrDefault(u => u.Username == username);
            return user != null && user.Password == password;
            */
        }
    }
}