namespace ESCE_SYSTEM.Services.UserContextService
{
    public interface IUserContextService
    {
        string? UserId { get; }
        string? UserEmail { get; }
        string? Role { get; }
    }
}
