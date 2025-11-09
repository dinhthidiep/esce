namespace ESCE_SYSTEM.Options
{
    public class JwtSetting
    {
        public required string Key { get; set; }
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public int ExpirationMinutes { get; set; }
        public required string GoogleClientID { get; set; }
    }
}
