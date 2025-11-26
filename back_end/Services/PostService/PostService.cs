using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Notifications;
using ESCE_SYSTEM.Helper;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Options;
using ESCE_SYSTEM.Repositories;
using ESCE_SYSTEM.Services.NotificationService;
using ESCE_SYSTEM.Services.UserContextService;
using ESCE_SYSTEM.Services.UserService;
using ESCE_SYSTEM.SignalR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly IPostReactionRepository _postReactionRepository;
        private readonly IPostSaveRepository _postSaveRepository;
        private readonly ICommentReactionRepository _commentReactionRepository;
        private readonly IUserService _userService;
        private readonly IUserContextService _userContextService;
        private readonly IHubContext<NotificationHub> _hubNotificationContext;
        private readonly INotificationService _notificationService;
        private readonly EmailHelper _emailHelper;
        private readonly EmailConfig _emailConfig;
        private readonly IWebHostEnvironment _env;

        private const string MissingContentOrImageMessage = "Bài viết phải có nội dung hoặc ít nhất một hình ảnh.";

        public PostService(
            IPostRepository postRepository,
            ICommentRepository commentRepository,
            IPostReactionRepository postReactionRepository,
            IPostSaveRepository postSaveRepository,
            ICommentReactionRepository commentReactionRepository,
            IUserService userService,
            IUserContextService userContextService,
            IHubContext<NotificationHub> hubNotificationContext,
            INotificationService notificationService,
            EmailHelper emailHelper,
            IOptions<EmailConfig> emailConfig,
            IWebHostEnvironment env)
        {
            _postRepository = postRepository;
            _commentRepository = commentRepository;
            _postReactionRepository = postReactionRepository;
            _postSaveRepository = postSaveRepository;
            _commentReactionRepository = commentReactionRepository;
            _userService = userService;
            _userContextService = userContextService;
            _hubNotificationContext = hubNotificationContext;
            _notificationService = notificationService;
            _emailHelper = emailHelper;
            _emailConfig = emailConfig.Value;
            _env = env;
        }

        public async Task<PostDetailDto> Create(PostDto postDto)
        {
            var currentUserId = _userContextService.GetCurrentUserId();
            var currentUser = await _userService.GetAccountByIdAsync(currentUserId);
            var normalizedImages = NormalizeImages(postDto.Images);
            EnsurePostHasContentOrImage(postDto.PostContent, normalizedImages);

            var post = new Post
            {
                Title = postDto.ArticleTitle ?? "Không có tiêu đề",
                Content = postDto.PostContent?.Trim() ?? string.Empty,
                AuthorId = currentUserId,
                Image = normalizedImages.Any() ? string.Join(",", normalizedImages) : null,
                CreatedAt = DateTime.Now,
                Status = "Pending",
                IsDeleted = false,
                CommentsCount = 0,
                ReactionsCount = 0,
                SavesCount = 0
            };

            var createdPost = await _postRepository.AddAsync(post);

            // Gửi thông báo cho tất cả Admin
            await GuiThongBaoChoAdmin(createdPost, "được tạo");

            return await GetPostDetail(createdPost.Id);
        }

        public async Task Delete(int id)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (post.AuthorId != currentUserId && !_userContextService.IsAdmin())
            {
                throw new UnauthorizedAccessException("Bạn không có quyền xóa bài viết này");
            }

            await _postRepository.SoftDeleteAsync(id);

            // Gửi thông báo cho tác giả
            await GuiThongBaoChoNguoiDung(post.AuthorId, "Bài viết đã bị xóa",
                $"Bài viết '{post.Title}' của bạn đã bị xóa");
        }

        public async Task<List<PostResponseDto>> GetAllPosts()
        {
            var posts = await _postRepository.GetAllAsync();
            return BuildPostResponseDtos(posts);
        }

        public async Task<List<PostResponseDto>> GetAllPostsApproved()
        {
            var posts = await _postRepository.GetApprovedPostsAsync();
            return BuildPostResponseDtos(posts);
        }

        public async Task<List<PostResponseDto>> GetAllPostsPending()
        {
            var posts = await _postRepository.GetPendingPostsAsync();
            return BuildPostResponseDtos(posts);
        }

        public async Task<PagedResult<PostResponseDto>> GetPostsPagedAsync(int pageNumber, int pageSize, string status = null, CancellationToken cancellationToken = default)
        {
            if (pageNumber < 1)
            {
                pageNumber = 1;
            }

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            var (posts, totalCount) = await _postRepository.GetPagedAsync(pageNumber, pageSize, status, cancellationToken);
            var postDtos = BuildPostResponseDtos(posts);

            return new PagedResult<PostResponseDto>
            {
                Items = postDtos,
                TotalItems = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<Post> GetById(int id)
        {
            return await _postRepository.GetByIdAsync(id);
        }

        public async Task<PostDetailDto> GetPostDetail(int postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null)
            {
                return null;
            }

            var comments = await _commentRepository.GetByPostIdAsync(postId);
            var reactions = await _postReactionRepository.GetByPostIdAsync(postId);

            var postDetail = new PostDetailDto
            {
                PostId = post.Id.ToString(),
                PostContent = post.Content,
                Images = post.Image?.Split(',').ToList() ?? new List<string>(),
                Status = post.Status,
                CreatedDate = post.CreatedAt ?? DateTime.Now,
                RejectComment = post.RejectComment ?? string.Empty,
                PosterName = post.Author?.Name ?? string.Empty,
                PublicDate = post.CreatedAt?.ToString("dd/MM/yyyy HH:mm") ?? string.Empty,
                PosterId = post.AuthorId.ToString(),
                PosterRole = post.Author?.Role?.Name ?? string.Empty,
                PosterApproverId = post.AuthorId.ToString(),
                PosterApproverName = post.Author?.Name ?? string.Empty,
                Hashtags = new List<string>(),
                Likes = reactions.Select(r => new PostLikeDetailDto
                {
                    AccountId = r.UserId.ToString(),
                    FullName = r.User?.Name ?? string.Empty,
                    CreatedDate = (r.CreatedAt ?? DateTime.Now).ToString("dd/MM/yyyy HH:mm")
                }).ToList(),
                Comments = comments.Select(c => new PostCommentDetailDto
                {
                    FullName = c.Author?.Name ?? string.Empty,
                    Content = c.Content,
                    CreatedDate = (c.CreatedAt ?? DateTime.Now).ToString("dd/MM/yyyy HH:mm"),
                    Images = c.Image != null ? new List<string> { c.Image } : new List<string>()
                }).ToList()
            };

            return postDetail;
        }

        public async Task Update(int id, PostDto postDto)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            var currentUserId = _userContextService.GetCurrentUserId();
            if (post.AuthorId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật bài viết này");
            }

            var normalizedImages = postDto.Images != null
                ? NormalizeImages(postDto.Images)
                : SplitImages(post.Image);

            var updatedImagesString = normalizedImages.Any()
                ? string.Join(",", normalizedImages)
                : null;

            var updatedContent = postDto.PostContent != null
                ? postDto.PostContent.Trim()
                : post.Content;

            EnsurePostHasContentOrImage(updatedContent, normalizedImages);

            post.Title = postDto.ArticleTitle ?? post.Title;
            post.Content = updatedContent;
            post.Image = updatedImagesString;
            post.UpdatedAt = DateTime.Now;

            await _postRepository.UpdateAsync(post);

            // Gửi thông báo cho admin khi post được cập nhật
            await GuiThongBaoChoAdmin(post, "được cập nhật");
        }

        public async Task Approve(ApprovePostDto approvePostDto)
        {
            var post = await _postRepository.GetByIdAsync(int.Parse(approvePostDto.PostId));
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            if (!_userContextService.IsAdmin())
            {
                throw new UnauthorizedAccessException("Chỉ Admin mới có thể duyệt bài viết");
            }

            post.Status = "Approved";
            post.UpdatedAt = DateTime.Now;

            await _postRepository.UpdateAsync(post);

            // Gửi email và thông báo cho tác giả
            await GuiThongBaoPheDuyetBaiViet(post);
        }

        public async Task Reject(RejectPostDto rejectPostDto)
        {
            var post = await _postRepository.GetByIdAsync(int.Parse(rejectPostDto.PostId));
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            if (!_userContextService.IsAdmin())
            {
                throw new UnauthorizedAccessException("Chỉ Admin mới có thể từ chối bài viết");
            }

            post.Status = "Rejected";
            post.RejectComment = rejectPostDto.Comment;
            post.UpdatedAt = DateTime.Now;

            await _postRepository.UpdateAsync(post);

            // Gửi email và thông báo cho tác giả
            await GuiThongBaoTuChoiBaiViet(post, rejectPostDto.Comment);
        }

        public async Task Review(ReviewPostDto reviewPostDto)
        {
            var post = await _postRepository.GetByIdAsync(int.Parse(reviewPostDto.PostId));
            if (post == null)
            {
                throw new Exception("Không tìm thấy bài viết");
            }

            if (!_userContextService.IsAdmin())
            {
                throw new UnauthorizedAccessException("Chỉ Admin mới có thể yêu cầu chỉnh sửa bài viết");
            }

            post.Status = "Review";
            post.ReviewComments = reviewPostDto.Comment;
            post.UpdatedAt = DateTime.Now;

            await _postRepository.UpdateAsync(post);

            // Gửi email và thông báo cho tác giả
            await GuiThongBaoYeuCauChinhSua(post, reviewPostDto.Comment);
        }

        private List<PostResponseDto> BuildPostResponseDtos(IEnumerable<Post> posts)
        {
            return posts.Select(BuildPostResponseDto).ToList();
        }

        private PostResponseDto BuildPostResponseDto(Post post)
        {
            var postDto = new PostResponseDto
            {
                PostId = post.Id.ToString(),
                PostContent = post.Content,
                Images = post.Image?.Split(',').ToList() ?? new List<string>(),
                PosterId = post.AuthorId.ToString(),
                PosterRole = post.Author?.Role?.Name ?? string.Empty,
                PosterName = post.Author?.Name ?? string.Empty,
                Status = post.Status,
                RejectComment = post.RejectComment ?? string.Empty,
                PosterApproverId = post.AuthorId.ToString(),
                PosterApproverName = post.Author?.Name ?? string.Empty,
                PublicDate = post.CreatedAt?.ToString("dd/MM/yyyy HH:mm") ?? string.Empty,
                ArticleTitle = post.Title,
                Hashtags = new List<string>(),
                Likes = new List<PostLikeResponseDto>(),
                Comments = new List<PostCommentResponseDto>()
            };

            foreach (var reaction in post.Postreactions ?? Enumerable.Empty<Postreaction>())
            {
                postDto.Likes.Add(new PostLikeResponseDto
                {
                    PostLikeId = reaction.Id.ToString(),
                    AccountId = reaction.UserId.ToString(),
                    FullName = reaction.User?.Name ?? string.Empty,
                    CreatedDate = reaction.CreatedAt ?? DateTime.Now,
                    ReactionType = reaction.ReactionType?.Name ?? "like"
                });
            }

            foreach (var comment in post.Comments ?? Enumerable.Empty<Comment>())
            {
                var commentDto = new PostCommentResponseDto
                {
                    PostCommentId = comment.Id.ToString(),
                    FullName = comment.Author?.Name ?? string.Empty,
                    Content = comment.Content,
                    Images = comment.Image != null ? new List<string> { comment.Image } : new List<string>(),
                    CreatedDate = comment.CreatedAt,
                    Likes = new List<PostCommentLikeResponseDto>(),
                    Replies = new List<ReplyPostCommentResponseDto>()
                };

                foreach (var commentReaction in comment.Commentreactions ?? Enumerable.Empty<Commentreaction>())
                {
                    commentDto.Likes.Add(new PostCommentLikeResponseDto
                    {
                        PostCommentLikeId = commentReaction.Id.ToString(),
                        AccountId = commentReaction.UserId.ToString(),
                        FullName = commentReaction.User?.Name ?? string.Empty,
                        CreatedDate = commentReaction.CreatedAt ?? DateTime.Now
                    });
                }

                postDto.Comments.Add(commentDto);
            }

            return postDto;
        }

        #region Private Methods - Email & Notification (Tiếng Việt)

        private static void EnsurePostHasContentOrImage(string? content, IEnumerable<string> images)
        {
            var hasContent = !string.IsNullOrWhiteSpace(content);
            var hasImages = images.Any();

            if (!hasContent && !hasImages)
            {
                throw new ArgumentException(MissingContentOrImageMessage);
            }
        }

        private static List<string> NormalizeImages(List<string>? images)
        {
            if (images == null)
            {
                return new List<string>();
            }

            return images
                .Where(image => !string.IsNullOrWhiteSpace(image))
                .Select(image => image.Trim())
                .ToList();
        }

        private static List<string> SplitImages(string? images)
        {
            if (string.IsNullOrWhiteSpace(images))
            {
                return new List<string>();
            }

            return images
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(image => image.Trim())
                .Where(image => !string.IsNullOrWhiteSpace(image))
                .ToList();
        }

        private async Task GuiThongBaoChoAdmin(Post post, string hanhDong)
        {
            try
            {
                // Lấy tất cả admin users (Giả định hàm này trả về List<int> ID)
                var adminUserIds = await _userService.GetAllAdminAndHostId();

                foreach (var adminId in adminUserIds)
                {
                    var notificationDto = new NotificationDto
                    {
                        UserId = adminId,
                        Title = $"Bài viết mới {hanhDong.ToUpper()} - Cần phê duyệt",
                        Message = $"Bài viết '{post.Title}' đã {hanhDong} và cần được phê duyệt",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };

                    // Sửa lỗi CS0815: Chỉ await, không gán cho biến var
                    await _notificationService.AddNotificationAsync(notificationDto);

                    await _hubNotificationContext.Clients.User(adminId.ToString())
                        .SendAsync("ReceiveNotification", notificationDto);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi thông báo cho admin: {ex.Message}");
            }
        }

        private async Task GuiThongBaoPheDuyetBaiViet(Post post)
        {
            var author = await _userService.GetAccountById(post.AuthorId);
            if (author != null)
            {
                var notificationDto = new NotificationDto
                {
                    UserId = author.Id,
                    Title = "Bài viết đã được phê duyệt",
                    Message = $"Bài viết '{post.Title}' của bạn đã được phê duyệt và đã được đăng",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationService.AddNotificationAsync(notificationDto);

                await _hubNotificationContext.Clients.User(author.Id.ToString())
                    .SendAsync("ReceiveNotification", notificationDto);

                await GuiEmailBaiViet(author, "PostApproved.html",
                    $"Bài viết '{post.Title}' đã được phê duyệt",
                    post.Title);
            }
        }

        private async Task GuiThongBaoTuChoiBaiViet(Post post, string lyDoTuChoi)
        {
            var author = await _userService.GetAccountById(post.AuthorId);
            if (author != null)
            {
                var notificationDto = new NotificationDto
                {
                    UserId = author.Id,
                    Title = "Bài viết bị từ chối",
                    Message = $"Bài viết '{post.Title}' của bạn đã bị từ chối. Lý do: {lyDoTuChoi}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationService.AddNotificationAsync(notificationDto);

                await _hubNotificationContext.Clients.User(author.Id.ToString())
                    .SendAsync("ReceiveNotification", notificationDto);

                await GuiEmailBaiViet(author, "PostRejected.html",
                    $"Bài viết '{post.Title}' đã bị từ chối",
                    post.Title, lyDoTuChoi);
            }
        }

        private async Task GuiThongBaoYeuCauChinhSua(Post post, string noiDungYeuCau)
        {
            var author = await _userService.GetAccountById(post.AuthorId);
            if (author != null)
            {
                var notificationDto = new NotificationDto
                {
                    UserId = author.Id,
                    Title = "Bài viết cần chỉnh sửa",
                    Message = $"Bài viết '{post.Title}' của bạn cần bổ sung thông tin. Yêu cầu: {noiDungYeuCau}",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationService.AddNotificationAsync(notificationDto);

                await _hubNotificationContext.Clients.User(author.Id.ToString())
                    .SendAsync("ReceiveNotification", notificationDto);

                await GuiEmailBaiViet(author, "PostReview.html",
                    $"Bài viết '{post.Title}' cần bổ sung thông tin",
                    post.Title, noiDungYeuCau);
            }
        }

        private async Task GuiThongBaoChoNguoiDung(int userId, string tieuDe, string noiDung)
        {
            var notificationDto = new NotificationDto
            {
                UserId = userId,
                Title = tieuDe,
                Message = noiDung,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationService.AddNotificationAsync(notificationDto);

            await _hubNotificationContext.Clients.User(userId.ToString())
                .SendAsync("ReceiveNotification", notificationDto);
        }

        private async Task GuiEmailBaiViet(Account user, string templateName, string subject, string postTitle, string comment = null)
        {
            try
            {
                string filePath = Path.Combine(_env.ContentRootPath, "EmailTemplates", templateName);
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"Không tìm thấy template email: {templateName}", filePath);
                }

                string htmlBody = await File.ReadAllTextAsync(filePath);
                string body = htmlBody
                    .Replace("{{UserName}}", user.Name)
                    .Replace("{{Hompage}}", _emailConfig.HomePage ?? "https://your-website.com")
                    .Replace("{{Comment}}", comment ?? "")
                    .Replace("{{PostTitle}}", postTitle);

                await _emailHelper.SendEmailAsync(subject, body, new List<string> { user.Email }, true);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Gửi email thất bại: {ex.Message}");
            }
            
        }
        #endregion 
    }
}
    