using Mapper;
using System.Linq;


namespace Service;

public static class LoginService
{
    private static HttpVO Registercheck(String username , String password , String password2)
    {
        var users = LoginMapper.GetAll();
        HttpVO httpVO = new HttpVO();
        httpVO.success = true;
        foreach (var user in users)
        {
            if (user.Username == username)
            {
                httpVO.success = false;
                httpVO.message = "Username already exists";
                return httpVO;
            }
        }
        if (password != password2)
        {
            httpVO.success = false;
            httpVO.message = "Passwords do not match";
            return httpVO;
        }
        return httpVO;
    }

    public static HttpVO Register(String username, String password, String password2)
    {
        // 输出注册请求的入参（调试用，确认接收的参数是否正确）
        Console.WriteLine($"=== 开始处理注册请求 ===");
        Console.WriteLine($"接收的注册参数：");
        Console.WriteLine($"用户名：{username}");
        Console.WriteLine($"密码：{password}（注意：生产环境请勿输出明文密码！）");
        Console.WriteLine($"确认密码：{password2}");

        // 执行注册校验
        HttpVO httpvo = Registercheck(username, password, password2);
        bool isCheckPass = httpvo.success;

        Console.WriteLine($"注册校验结果：{(isCheckPass ? "通过" : "失败")}");
        if (!isCheckPass)
        {
            // 校验失败，输出失败原因（假设 HttpVO 有 Message 属性存储失败信息）
            Console.WriteLine($"校验失败原因：{httpvo.message ?? "未说明具体原因"}");
            Console.WriteLine($"=== 注册请求处理结束（校验失败）===\n");
            return httpvo;
        }

        // 校验通过，创建 LoginDO（此处原代码未调用 Insert 方法，注意：仅创建对象不会写入数据库！）
        var loginDO = new LoginDO(
            Id: 0,
            Username: username,
            Password: password,
            Role: "customer"
        );
        LoginMapper.Insert(loginDO);

        // 输出创建的 LoginDO 信息（确认对象属性是否正确）
        Console.WriteLine($"校验通过，成功创建 LoginDO 对象：");
        Console.WriteLine($"LoginDO.Id：{loginDO.Id}");
        Console.WriteLine($"LoginDO.Username：{loginDO.Username}");
        Console.WriteLine($"LoginDO.Role：{loginDO.Role}");
        Console.WriteLine($"=== 注册请求处理结束（校验通过）===\n");

        // 【重要提醒】原代码仅创建了 LoginDO，未调用 LoginMapper.Insert(loginDO) 写入数据库！
        // 若需要将注册信息保存到数据库，需添加以下代码：
        // LoginMapper.Insert(loginDO);
        // Console.WriteLine($"注册信息已成功写入数据库（用户名：{username}）");

        return httpvo;
    }

    public static HttpVO ValidateLogin(string username, string password)
    {
        var users = LoginMapper.GetAll();
        HttpVO httpVO = new HttpVO();
        httpVO.success = false;
        foreach (var user in users)
        {
            if (user.Username == username && user.Password == password)
            {
                httpVO.success = true;
                httpVO.message = "Login successful";
                httpVO.data = new
                {
                    LoginId = user.Id,
                    LoginRole = user.Role,
                };
                return httpVO;
            }
        }
        httpVO.message = "Invalid username or password";
        return httpVO;
    }
}