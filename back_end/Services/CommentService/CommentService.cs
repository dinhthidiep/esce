using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Notifications;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services.UserService;
using Microsoft.AspNetCore.SignalR;
using ESCE_SYSTEM.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ESCE_SYSTEM.Services.NotificationService;
using ESCE_SYSTEM.Services.UserContextService;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace ESCE_SYSTEM.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IPostRepository _postRepository;
        private readonly IUserContextService _userContextService;
        private readonly IUserService _userService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;
        private readonly IWebHostEnvironment _env;

        public CommentService(
            ICommentRepository commentRepository,
            IPostRepository postRepository,
            IUserContextService userContextService,
            IUserService userService,
            INotificationService notificationService,
            IHubContext<NotificationHub> hubNotificationContext,
            IWebHostEnvironment env)
        {
            _commentRepository = commentRepository;
            _postRepository = postRepository;
            _userContextService = userContextService;
            _userService = userService;
            _notificationService = notificationService;
            _hubNotificationContext = hubNotificationContext;
            _env = env;
        }

        public async Task Create(PostCommentDto commentDto, Microsoft.AspNetCore.Http.IFormFile? imageFile = null)
        {
            var post = await _postRepository.GetByIdAsync(int.Parse(commentDto.PostId));
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            var currentUser = await _userService.GetAccountByIdAsync(currentUserId);

            string? imageFileName = null;

            // Handle image file upload
            if (imageFile != null && imageFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    throw new Exception("Invalid file type. Only image files are allowed.");
                }

                // Validate file size (5MB max)
                if (imageFile.Length > 5 * 1024 * 1024)
                {
                    throw new Exception("File size exceeds 5MB limit.");
                }

                // Generate unique filename
                imageFileName = $"{Guid.NewGuid()}{fileExtension}";
                var imagesDir = Path.Combine(_env.ContentRootPath, "wwwroot", "images");
                
                // Ensure directory exists
                if (!Directory.Exists(imagesDir))
                {
                    Directory.CreateDirectory(imagesDir);
                }

                var filePath = Path.Combine(imagesDir, imageFileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }
            }

            var comment = new Comment
            {
                PostId = int.Parse(commentDto.PostId),
                AuthorId = currentUserId,
                Content = commentDto.Content ?? string.Empty,
                Image = imageFileName, // Store filename instead of base64
                CreatedAt = DateTime.Now,
                IsDeleted = false,
                ReactionsCount = 0
            };

            if (!string.IsNullOrEmpty(commentDto.PostCommentId))
            {
                comment.ParentCommentId = int.Parse(commentDto.PostCommentId);

                // Gửi thông báo cho tác giả của comment gốc (reply)
                var parentComment = await _commentRepository.GetByIdAsync(int.Parse(commentDto.PostCommentId));
                if (parentComment != null && parentComment.AuthorId != currentUserId)
                {
                    await GuiThongBaoBinhLuan(parentComment.AuthorId, "Có phản hồi mới cho bình luận của bạn",
                        $"{currentUser.Name} đã phản hồi bình luận của bạn: {commentDto.Content?.Substring(0, Math.Min(50, commentDto.Content.Length))}...");
                }
            }
            else
            {
                // Gửi thông báo cho tác giả của bài viết (bình luận mới)
                if (post.AuthorId != currentUserId)
                {
                    await GuiThongBaoBinhLuan(post.AuthorId, "Có bình luận mới trên bài viết của bạn",
                        $"{currentUser.Name} đã bình luận trên bài viết của bạn: {commentDto.Content?.Substring(0, Math.Min(50, commentDto.Content.Length))}...");
                }
            }

            await _commentRepository.AddAsync(comment);

            // Cập nhật CommentsCount trong Post
            post.CommentsCount++;
            await _postRepository.UpdateAsync(post);
        }

        public async Task Delete(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
            {
                throw new Exception("Không tìm thấy bình luận");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (comment.AuthorId != currentUserId && !_userContextService.IsAdmin())
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa bình luận này");
            }

            // Store PostId before soft delete (in case comment.Post navigation is tracked)
            var postId = comment.PostId;

            // Delete associated image file
            if (!string.IsNullOrWhiteSpace(comment.Image))
            {
                DeleteImageFile(comment.Image);
            }

            await _commentRepository.SoftDeleteAsync(id);

            // Cập nhật CommentsCount trong Post
            // Use GetByIdWithoutIncludesAsync to avoid tracking conflicts with related entities
            try
            {
                var actualCount = await _postRepository.GetCommentsCountAsync(postId);
                // Get Post without includes to avoid Entity Framework tracking conflicts
                var post = await _postRepository.GetByIdWithoutIncludesAsync(postId);
                if (post != null)
                {
                    post.CommentsCount = actualCount;
                    await _postRepository.UpdateAsync(post);
                }
            }
            catch (Exception ex)
            {
                // Log but don't fail the delete operation if post update fails
                // The comment is already soft deleted, so the operation succeeded
                Console.WriteLine($"Failed to update post CommentsCount after comment delete: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
            }

            // Gửi thông báo cho tác giả của bình luận (if notification system is working)
            try
            {
                await GuiThongBaoBinhLuan(comment.AuthorId, "Bình luận đã bị xóa",
                    "Bình luận của bạn đã bị xóa");
            }
            catch (Exception notifEx)
            {
                // Log but don't fail the delete operation if notification fails
                Console.WriteLine($"Failed to send notification after comment delete: {notifEx.Message}");
            }
        }

        public async Task<Comment> GetById(int id)
        {
            return await _commentRepository.GetByIdAsync(id);
        }

        public async Task<List<Comment>> GetByPostId(int postId)
        {
            // Repository already includes Author with .Include(c => c.Author)
            // JSON serializer will include Author property (ReferenceHandler.IgnoreCycles only prevents circular refs)
            return (await _commentRepository.GetByPostIdAsync(postId)).ToList();
        }

        public async Task Update(int id, UpdatePostCommentDto commentDto)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
            {
                throw new Exception("Không tìm thấy bình luận");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (comment.AuthorId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật bình luận này");
            }

            var oldContent = comment.Content;
            comment.Content = commentDto.Content ?? comment.Content;
            // Image is handled separately via file upload, preserve existing if no new file
            comment.UpdatedAt = DateTime.Now;

            await _commentRepository.UpdateAsync(comment);

            // Gửi thông báo cho tác giả của bài viết khi bình luận được cập nhật
            var post = await _postRepository.GetByIdAsync(comment.PostId);
            if (post != null && post.AuthorId != currentUserId)
            {
                var currentUser = await _userService.GetAccountByIdAsync(currentUserId);
                await GuiThongBaoBinhLuan(post.AuthorId, "Bình luận đã được cập nhật",
                    $"{currentUser.Name} đã cập nhật bình luận trên bài viết của bạn");
            }
        }

        /// <summary>
        /// Safely deletes an image file from the wwwroot/images directory.
        /// </summary>
        private bool DeleteImageFile(string? imageFileName)
        {
            if (string.IsNullOrWhiteSpace(imageFileName))
                return false;

            try
            {
                var imagesDir = Path.Combine(_env.ContentRootPath, "wwwroot", "images");
                var filePath = Path.Combine(imagesDir, imageFileName);

                // Security check: ensure the file path is within the images directory
                if (!Path.GetFullPath(filePath).StartsWith(Path.GetFullPath(imagesDir), StringComparison.OrdinalIgnoreCase))
                {
                    // Path traversal attempt - log and ignore
                    return false;
                }

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return true;
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - we don't want to fail the operation if file deletion fails
                Console.WriteLine($"Failed to delete image file '{imageFileName}': {ex.Message}");
            }

            return false;
        }

        private async Task GuiThongBaoBinhLuan(int userId, string tieuDe, string noiDung)
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
    }
}