using BCrypt.Net;

namespace ESCE_SYSTEM
{
    public class PasswordHashGenerator
    {
        public static void GeneratePasswordHash()
        {
            string password = "12345";
            
            // Tạo salt tự động (BCrypt tự động tạo salt)
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            
            Console.WriteLine("=== PASSWORD HASH GENERATOR ===");
            Console.WriteLine($"Original Password: {password}");
            Console.WriteLine($"Hashed Password: {hashedPassword}");
            Console.WriteLine();
            
            // Kiểm tra password
            bool isValid = BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            Console.WriteLine($"Password Verification: {isValid}");
            Console.WriteLine();
            
            // Tạo thêm một số hash khác nhau để demo
            Console.WriteLine("=== MULTIPLE HASHES (same password, different salts) ===");
            for (int i = 1; i <= 3; i++)
            {
                string hash = BCrypt.Net.BCrypt.HashPassword(password);
                Console.WriteLine($"Hash {i}: {hash}");
            }
        }
    }
}

