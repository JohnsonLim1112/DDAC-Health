public class Tools
{
    public static string Token(string Password)
    {

        byte[] PasswordBytes = System.Text.Encoding.UTF8.GetBytes(Password);
        byte[] HashBytes = System.Security.Cryptography.SHA256.Create().ComputeHash(PasswordBytes);
        string Hash = Convert.ToBase64String(HashBytes);

        return Hash;
    }
 }
