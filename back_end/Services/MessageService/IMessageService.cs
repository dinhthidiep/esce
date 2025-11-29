
using System.Collections.Generic;
using System.Threading.Tasks;
using ESCE_SYSTEM.DTOs.Message;
using ESCE_SYSTEM.Models;

namespace ESCE_SYSTEM.Services.MessageService
{
    public interface IMessageService
    {
        Task<IEnumerable<ChatUserDto>> GetChattedUsers(string userId);
        Task<IEnumerable<ChatUserDto>> GetAllUserForChat(string userId);
        Task<IEnumerable<Message>> GetChatHistory(string userAId, string userBId);
        Task<Message> AddNewChatMessage(string senderId, string receiverId, string content);
    }
}