using ESCE_SYSTEM.DTOs.Notifications;
using ESCE_SYSTEM.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.AspNetCore.SignalR;
using ESCE_SYSTEM.SignalR;

namespace ESCE_SYSTEM.Services.NotificationService
{
    public class NotificationService : INotificationService
    {
        // Thay thế INotificationRepository bằng ESCEContext
        private readonly ESCEContext _dbContext;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;

        public NotificationService(ESCEContext dbContext, IHubContext<NotificationHub> hubNotificationContext)
        {
            _dbContext = dbContext;
            _hubNotificationContext = hubNotificationContext;
        }

        // 🟢 HÀM HỖ TRỢ CHUYỂN ĐỔI STRING ID -> INT ID
        private int ParseUserId(string userId)
        {
            if (int.TryParse(userId, out int id)) return id;
            throw new ArgumentException($"ID người dùng '{userId}' không hợp lệ.");
        }

        public async Task AddNotificationAsync(NotificationDto notificationDto)
        {
            // Map DTO sang Model SQL
            var notification = new Notification
            {
                UserId = ParseUserId(notificationDto.UserId.ToString()), // UserId từ DTO phải là string
                Message = notificationDto.Message,
                IsRead = false, // Mặc định là false
                CreatedAt = DateTime.UtcNow
                // Lưu ý: Bỏ qua các trường NotificationId, ObjectType, ObjectId nếu Model SQL không có
            };

            await _dbContext.Notifications.AddAsync(notification);
            await _dbContext.SaveChangesAsync();
        }

        public async Task Delete(int notificationId)
        {
            // Tìm thông báo bằng EF Core
            var notification = await _dbContext.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId);

            if (notification == null)
            {
                throw new Exception("Notification not found");
            }

            // ⚠️ Vì Model mới không có trường IsDelete, tôi sẽ xóa vật lý (hoặc thêm IsDelete vào Model)
            // Nếu bạn muốn xóa mềm: Thêm IsDelete vào Model Notification.
            // Nếu xóa vật lý:
            _dbContext.Notifications.Remove(notification);

            await _dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationUnReadByUserIdAsyc(string userId)
        {
            var userIntId = ParseUserId(userId);

            // Truy vấn EF Core thay thế Builders<Notification>.Filter
            var notifications = await _dbContext.Notifications
                .Where(n => n.UserId == userIntId && n.IsRead == false)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            // Map Model SQL về DTO
            // Đảm bảo bạn đã cấu hình Mapster hoặc sử dụng Select để map thủ công
            return notifications.Adapt<List<NotificationDto>>();
        }

        public async Task IsRead(int notificationId)
        {
            var notification = await _dbContext.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId);

            if (notification == null)
            {
                throw new Exception("Notification not found");
            }

            notification.IsRead = true;
            await _dbContext.SaveChangesAsync();
        }

        public async Task SendNotificationToUserAsync(SendNotificationDto sendDto)
        {
            var userId = ParseUserId(sendDto.UserId);
            
            // Check if user exists
            var user = await _dbContext.Accounts.FirstOrDefaultAsync(a => a.Id == userId);
            if (user == null)
            {
                throw new Exception($"User with ID {sendDto.UserId} not found");
            }

            // Create notification
            var notification = new Notification
            {
                UserId = userId,
                Message = sendDto.Message,
                Title = sendDto.Title ?? "Thông báo từ quản trị viên",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Notifications.Add(notification);
            await _dbContext.SaveChangesAsync();

            // Send SignalR notification
            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                UserId = notification.UserId,
                Message = notification.Message,
                Title = notification.Title,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            await _hubNotificationContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notificationDto);
        }
    }
}