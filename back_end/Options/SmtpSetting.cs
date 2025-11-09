namespace ESCE_SYSTEM.Options
{
    public class SmtpSetting
    {
        public required string SmtpServer { get; set; }
        public required string FromEmail { get; set; }
        public required string Password { get; set; }
        public int Port { get; set; }
        public required string AppName { get; set; }
    }
}
