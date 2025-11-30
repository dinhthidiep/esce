using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Notifications;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services.UserService;
using Microsoft.AspNetCore.SignalR;
using ESCE_SYSTEM.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using ESCE_SYSTEM.Services.NotificationService;
using ESCE_SYSTEM.Services.UserContextService;

namespace ESCE_SYSTEM.Services
{
    public class CommentReactionService : ICommentReactionService
    {
        private readonly ICommentReactionRepository _commentReactionRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;
        private readonly ESCEContext _context;

        public CommentReactionService(
            ICommentReactionRepository commentReactionRepository,
            ICommentRepository commentRepository,
            IUserContextService userContextService,
            IUserService userService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubNotificationContext,
            ESCEContext context)
        {
            _commentReactionRepository = commentReactionRepository;
            _commentRepository = commentRepository;
            _userContextService = userContextService;
            _userService = userService;
            _notificationService = notificationService;
            _hubNotificationContext = hubNotificationContext;
            _context = context;
        }

        public async Task LikeComment(PostCommentLikeDto postCommentLikeDto)
        {
            var currentUserId = _userContextService.GetCurrentUserId();
            var commentId = int.Parse(postCommentLikeDto.PostCommentId);

            var existingReaction = await _commentReactionRepository.GetByUserAndCommentAsync(currentUserId, commentId);

            if (existingReaction != null)
            {
                throw new Exception("Bạn đã thích bình luận này rồi");
            }

            var comment = await _commentRepository.GetByIdAsync(commentId);
            if (comment == null)
            {
                throw new Exception("Không tìm thấy bình luận");
            }

            // Lấy hoặc tạo ReactionType "Like"
            var reactionType = await GetOrCreateReactionType("Like");
            if (reactionType == null)
            {
                throw new Exception("Không thể lấy hoặc tạo loại reaction. Vui lòng thử lại sau.");
            }

            var commentReaction = new Commentreaction
            {
                UserId = currentUserId,
                CommentId = commentId,
                ReactionTypeId = reactionType.Id,
                CreatedAt = DateTime.Now
            };

            await _commentReactionRepository.AddAsync(commentReaction);

            // Update reaction count in comment
            comment.ReactionsCount++;
            await _commentRepository.UpdateAsync(comment);

            // Gửi thông báo cho tác giả của bình luận (trừ khi tác giả là người like)
            if (comment.AuthorId != currentUserId)
            {
                var currentUser = await _userService.GetAccountByIdAsync(currentUserId);
                await GuiThongBaoReactionBinhLuan(comment.AuthorId, "Có người thích bình luận của bạn",
                    $"{currentUser.Name} đã thích bình luận của bạn");
            }
        }

        public async Task UnlikeComment(int commentReactionId)
        {
            var commentReaction = await _commentReactionRepository.GetByIdAsync(commentReactionId);
            if (commentReaction == null)
            {
                throw new Exception("Không tìm thấy lượt thích");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (commentReaction.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền bỏ lượt thích này");
            }

            await _commentReactionRepository.DeleteAsync(commentReactionId);

            // Update reaction count in comment
            var comment = await _commentRepository.GetByIdAsync(commentReaction.CommentId);
            if (comment != null && comment.ReactionsCount > 0)
            {
                comment.ReactionsCount--;
                await _commentRepository.UpdateAsync(comment);
            }
        }

        public async Task<int> GetLikeCount(int commentId)
        {
            return await _commentReactionRepository.GetCountByCommentIdAsync(commentId);
        }

        private async Task GuiThongBaoReactionBinhLuan(int userId, string tieuDe, string noiDung)
        {
            var notificationDto = new NotificationDto
            {
                UserId = userId,
                Title = tieuDe,
                Message = noiDung,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            await _notificationService.AddNotificationAsync(notificationDto);

            await _hubNotificationContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notificationDto);
        }

        private async Task<ReactionType?> GetOrCreateReactionType(string name)
        {
            // Ưu tiên tìm ReactionType với Id = 1 (cho "Like")
            if (name.ToLower() == "like")
            {
                var reactionTypeById = await _context.ReactionTypes
                    .FirstOrDefaultAsync(rt => rt.Id == 1);
                
                if (reactionTypeById != null)
                {
                    // Nếu Id = 1 tồn tại nhưng tên khác, cập nhật tên
                    if (reactionTypeById.Name.ToLower() != "like")
                    {
                        reactionTypeById.Name = "Like";
                        await _context.SaveChangesAsync();
                    }
                    return reactionTypeById;
                }
            }

            // Tìm ReactionType theo tên
            var reactionType = await _context.ReactionTypes
                .FirstOrDefaultAsync(rt => rt.Name.ToLower() == name.ToLower());

            if (reactionType != null)
            {
                return reactionType;
            }

            // Nếu không tìm thấy, tạo mới
            // Nếu là "Like", sử dụng Id = 1, nếu không thì tìm ID lớn nhất
            byte newId;
            if (name.ToLower() == "like")
            {
                newId = 1;
            }
            else
            {
                var maxId = await _context.ReactionTypes
                    .Select(rt => (int?)rt.Id)
                    .DefaultIfEmpty(0)
                    .MaxAsync();
                newId = (byte)(maxId + 1);
            }

            var newReactionType = new ReactionType
            {
                Id = newId,
                Name = name
            };

            try
            {
                _context.ReactionTypes.Add(newReactionType);
                await _context.SaveChangesAsync();
                return newReactionType;
            }
            catch (Exception ex)
            {
                // Nếu có lỗi (ví dụ: duplicate ID hoặc name), thử lấy lại từ database
                var existing = await _context.ReactionTypes
                    .FirstOrDefaultAsync(rt => rt.Id == newId || rt.Name.ToLower() == name.ToLower());
                
                if (existing != null)
                {
                    return existing;
                }
                
                throw new Exception($"Không thể tạo ReactionType '{name}': {ex.Message}");
            }
        }
    }
}