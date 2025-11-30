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
    public class PostReactionService : IPostReactionService
    {
        private readonly IPostReactionRepository _postReactionRepository;
        private readonly IPostRepository _postRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;
        private readonly ESCEContext _context;

        public PostReactionService(
            IPostReactionRepository postReactionRepository,
            IPostRepository postRepository,
            IUserContextService userContextService,
            IUserService userService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubNotificationContext,
            ESCEContext context)
        {
            _postReactionRepository = postReactionRepository;
            _postRepository = postRepository;
            _userContextService = userContextService;
            _userService = userService;
            _notificationService = notificationService;
            _hubNotificationContext = hubNotificationContext;
            _context = context;
        }

        public async Task<PostToggleLikeResponseDto> ToggleLikePost(int postId)
        {
            var currentUserId = _userContextService.GetCurrentUserId();
            var existingReaction = await _postReactionRepository.GetByUserAndPostAsync(currentUserId, postId);

            // Nếu đã thích rồi, thì bỏ thích (toggle)
            if (existingReaction != null)
            {
                await UnlikePost(existingReaction.Id);
                return new PostToggleLikeResponseDto
                {
                    IsLiked = false,
                    Reaction = null,
                    PostId = postId
                };
            }

            // Nếu chưa thích, thì thích
            var likeResponse = await LikePostInternal(postId);
            return new PostToggleLikeResponseDto
            {
                IsLiked = true,
                Reaction = likeResponse,
                PostId = postId
            };
        }

        public async Task<PostLikeResponseDto> LikePost(int postId)
        {
            var currentUserId = _userContextService.GetCurrentUserId();
            var existingReaction = await _postReactionRepository.GetByUserAndPostAsync(currentUserId, postId);

            if (existingReaction != null)
            {
                throw new Exception("Bạn đã thích bài viết này rồi");
            }

            return await LikePostInternal(postId);
        }

        private async Task<PostLikeResponseDto> LikePostInternal(int postId)
        {
            var currentUserId = _userContextService.GetCurrentUserId();
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            // Lấy hoặc tạo ReactionType "Like"
            var reactionType = await GetOrCreateReactionType("Like");
            if (reactionType == null)
            {
                throw new Exception("Không thể lấy hoặc tạo loại reaction. Vui lòng thử lại sau.");
            }

            // Đảm bảo ReactionType tồn tại trong database bằng cách reload
            // Điều này đảm bảo foreign key constraint sẽ được thỏa mãn
            var reactionTypeId = reactionType.Id;
            var verifiedReactionType = await _context.ReactionTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(rt => rt.Id == reactionTypeId);
            
            if (verifiedReactionType == null)
            {
                throw new Exception($"ReactionType với Id {reactionTypeId} không tồn tại trong database. Vui lòng thử lại sau.");
            }

            // Sử dụng trực tiếp _context để đảm bảo cùng context với ReactionType đã tạo
            var postReaction = new Postreaction
            {
                UserId = currentUserId,
                PostId = postId,
                ReactionTypeId = verifiedReactionType.Id,
                CreatedAt = DateTime.Now
            };

            Postreaction createdReaction;
            try
            {
                // Thêm trực tiếp vào context để đảm bảo cùng context với ReactionType
                _context.Postreactions.Add(postReaction);
                await _context.SaveChangesAsync();
                createdReaction = postReaction;
            }
            catch (DbUpdateException dbEx)
            {
                // Xử lý lỗi database cụ thể
                if (dbEx.InnerException != null)
                {
                    var innerMsg = dbEx.InnerException.Message.ToLower();
                    if (innerMsg.Contains("foreign key") || innerMsg.Contains("fk__"))
                    {
                        // Thử reload lại ReactionType và Post để đảm bảo chúng tồn tại
                        var retryReactionType = await _context.ReactionTypes
                            .AsNoTracking()
                            .FirstOrDefaultAsync(rt => rt.Id == reactionTypeId);
                        var retryPost = await _context.Posts
                            .AsNoTracking()
                            .FirstOrDefaultAsync(p => p.Id == postId);
                        
                        if (retryReactionType == null)
                        {
                            throw new Exception($"ReactionType với Id {reactionTypeId} không tồn tại. Vui lòng liên hệ quản trị viên.");
                        }
                        if (retryPost == null)
                        {
                            throw new Exception($"Bài viết với Id {postId} không tồn tại.");
                        }
                        
                        throw new Exception("Lỗi: Dữ liệu không hợp lệ. Vui lòng kiểm tra ReactionTypeId hoặc thông tin bài viết.");
                    }
                    if (innerMsg.Contains("unique") || innerMsg.Contains("duplicate") || innerMsg.Contains("uq__"))
                    {
                        throw new Exception("Bạn đã thích bài viết này rồi.");
                    }
                }
                throw new Exception($"Không thể lưu lượt thích: {dbEx.Message}. Chi tiết: {dbEx.InnerException?.Message ?? "Không có thông tin chi tiết"}");
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thích bài viết: {ex.Message}");
            }

            // Update reaction count in post
            post.ReactionsCount++;
            await _postRepository.UpdateAsync(post);

            var currentUser = await _userService.GetAccountByIdAsync(currentUserId);

            // Gửi thông báo cho tác giả của bài viết (trừ khi tác giả là người like)
            if (post.AuthorId != currentUserId && currentUser != null)
            {
                await GuiThongBaoReaction(post.AuthorId, "Có người thích bài viết của bạn",
                    $"{currentUser.Name} đã thích bài viết: {post.Title}");
            }

            return new PostLikeResponseDto
            {
                PostLikeId = createdReaction.Id.ToString(),
                AccountId = currentUserId.ToString(),
                FullName = currentUser?.Name ?? string.Empty,
                CreatedDate = createdReaction.CreatedAt ?? DateTime.Now,
                ReactionType = "like"
            };
        }

        public async Task<int> UnlikePost(int postReactionId)
        {
            var postReaction = await _postReactionRepository.GetByIdAsync(postReactionId);
            if (postReaction == null)
            {
                throw new Exception("Không tìm thấy lượt thích");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (postReaction.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền bỏ lượt thích này");
            }

            await _postReactionRepository.DeleteAsync(postReactionId);

            // Update reaction count in post
            var post = await _postRepository.GetByIdAsync(postReaction.PostId);
            if (post != null && post.ReactionsCount > 0)
            {
                post.ReactionsCount--;
                await _postRepository.UpdateAsync(post);
            }

            return postReaction.PostId;
        }

        public async Task<int> GetLikeCount(int postId)
        {
            return await _postReactionRepository.GetCountByPostIdAsync(postId);
        }

        private async Task GuiThongBaoReaction(int userId, string tieuDe, string noiDung)
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
                
                // Reload từ database để đảm bảo entity tồn tại và có thể được sử dụng
                // Detach entity hiện tại để tránh tracking conflicts
                _context.Entry(newReactionType).State = EntityState.Detached;
                
                // Reload với tracking để có thể sử dụng trong foreign key
                var savedReactionType = await _context.ReactionTypes
                    .FirstOrDefaultAsync(rt => rt.Id == newId);
                
                if (savedReactionType == null)
                {
                    // Nếu không tìm thấy, thử reload lại với AsNoTracking
                    savedReactionType = await _context.ReactionTypes
                        .AsNoTracking()
                        .FirstOrDefaultAsync(rt => rt.Id == newId);
                }
                
                return savedReactionType ?? newReactionType;
            }
            catch (DbUpdateException dbEx)
            {
                // Nếu có lỗi duplicate (ID hoặc name), thử lấy lại từ database
                var existing = await _context.ReactionTypes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(rt => rt.Id == newId || rt.Name.ToLower() == name.ToLower());
                
                if (existing != null)
                {
                    return existing;
                }
                
                // Log chi tiết lỗi để debug
                var errorDetails = dbEx.InnerException?.Message ?? dbEx.Message;
                throw new Exception($"Không thể tạo ReactionType '{name}' (Id: {newId}): {errorDetails}");
            }
            catch (Exception ex)
            {
                // Nếu có lỗi khác, thử lấy lại từ database
                var existing = await _context.ReactionTypes
                    .AsNoTracking()
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