using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.PostRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Mapster;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services.PostService
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IUserContextService _userContextService;
        private readonly ESCEContext _context;
        // ... (Giả sử bạn có các dependencies khác như UserService, NotificationService)

        public PostService(IPostRepository postRepository, IUserContextService userContextService, ESCEContext context /*, ...*/)
        {
            _postRepository = postRepository;
            _userContextService = userContextService;
            _context = context;
        }

        public async Task<Post> CreateAsync(PostDto postDto)
        {
            if (!int.TryParse(_userContextService.UserId, out int authorId))
                throw new UnauthorizedAccessException("User ID không hợp lệ.");

            var newPost = postDto.Adapt<Post>();
            newPost.AuthorId = authorId;
            newPost.CreatedAt = DateTime.UtcNow;
            // Cần thêm logic gán Status = "Pending" nếu Model Post có trường Status

            await _postRepository.AddAsync(newPost);
            return newPost;
        }

        public async Task DeleteAsync(int id)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null) throw new Exception("Post not found.");
            // Thêm kiểm tra quyền xóa
            await _postRepository.DeleteAsync(post);
        }

        public async Task UpdateAsync(int id, PostDto postDto)
        {
            var post = await _postRepository.GetByIdAsync(id);
            if (post == null) throw new Exception("Post not found.");

            if (!int.TryParse(_userContextService.UserId, out int currentUserId) || post.AuthorId != currentUserId)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa bài viết này.");

            post.Title = postDto.Title;
            post.Content = postDto.Content;
            post.Image = postDto.Image;
            post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
        }

        public async Task ApproveAsync(ApprovePostDto approvePostDto)
        {
            var post = await _postRepository.GetByIdAsync(approvePostDto.PostId);
            if (post == null) throw new Exception("Post not found.");

            // post.Status = "Approved"; // Cần thuộc tính Status
            // post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
            // Thêm logic gửi thông báo cho tác giả
        }

        public async Task RejectAsync(RejectPostDto rejectPostDto)
        {
            var post = await _postRepository.GetByIdAsync(rejectPostDto.PostId);
            if (post == null) throw new Exception("Post not found.");

            // post.Status = "Rejected"; // Cần thuộc tính Status
            // post.RejectComment = rejectPostDto.Comment; // Cần thuộc tính RejectComment
            // post.UpdatedAt = DateTime.UtcNow;

            await _postRepository.UpdateAsync(post);
            // Thêm logic gửi thông báo cho tác giả
        }

        public Task<Post?> GetByIdAsync(int id) => _postRepository.GetByIdAsync(id);

        // Các phương thức lấy danh sách cần logic lọc (giả định)
        public Task<List<PostResponseDto>> GetAllPostsAsync() { throw new NotImplementedException(); }
        public Task<List<Post>> GetAllPostsApprovedAsync() { throw new NotImplementedException(); }
        public Task<List<Post>> GetAllPostsPendingAsync() { throw new NotImplementedException(); }

        public async Task<int> CreateTourAsync(CreateTourDto createTourDto)
        {
            // For now, use a default host ID since we're not requiring authentication
            // In a real app, you'd get this from the authenticated user
            int hostId = 4; // Use the host account (Farm Happy Land)

            var service = new Service
            {
                Name = createTourDto.Name,
                Description = createTourDto.Address, // Using address as description for now
                Price = createTourDto.Price,
                HostId = hostId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add the service to the database
            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            return service.Id;
        }

        public async Task<List<TourResponseDto>> GetAllToursAsync()
        {
            var services = await _context.Services
                .ToListAsync(); // Get all services for debugging

            var tourResponseDtos = services.Select(s => new TourResponseDto
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Description, // Using description as address for now
                Price = s.Price,
                HostId = s.HostId,
                CreatedAt = s.CreatedAt ?? DateTime.UtcNow
            }).ToList();

            return tourResponseDtos;
        }

        public async Task<int> CreateTourComboAsync(CreateTourComboDto createTourComboDto)
        {
            // For now, use a default host ID since we're not requiring authentication
            // In a real app, you'd get this from the authenticated user
            int hostId = 4; // Use the host account (Farm Happy Land)

            var serviceCombo = new Servicecombo
            {
                Name = createTourComboDto.Name,
                Address = createTourComboDto.Address,
                Description = createTourComboDto.Description,
                Price = createTourComboDto.Price,
                AvailableSlots = createTourComboDto.AvailableSlots,
                Image = createTourComboDto.Image,
                Status = createTourComboDto.Status ?? "open",
                CancellationPolicy = createTourComboDto.CancellationPolicy,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                HostId = hostId
            };

            // Add the service combo to the database
            _context.Servicecombos.Add(serviceCombo);
            await _context.SaveChangesAsync();

            // Add the tour details to the database
            if (createTourComboDto.TourDetails != null && createTourComboDto.TourDetails.Any())
            {
                foreach (var detail in createTourComboDto.TourDetails)
                {
                    var serviceComboDetail = new ServicecomboDetail
                    {
                        ServicecomboId = serviceCombo.Id,
                        ServiceId = detail.ServiceId,
                        Quantity = detail.Quantity
                    };
                    _context.ServicecomboDetails.Add(serviceComboDetail);
                }
                await _context.SaveChangesAsync();
            }

            return serviceCombo.Id;
        }

        public async Task<List<TourComboResponseDto>> GetAllTourCombosAsync()
        {
            var serviceCombos = await _context.Servicecombos
                .Include(sc => sc.ServicecomboDetails)
                .ToListAsync();

            var tourComboResponseDtos = serviceCombos.Select(sc => new TourComboResponseDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Address = sc.Address,
                Description = sc.Description,
                Price = sc.Price,
                AvailableSlots = sc.AvailableSlots,
                Image = sc.Image,
                Status = sc.Status,
                CancellationPolicy = sc.CancellationPolicy,
                CreatedAt = sc.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = sc.UpdatedAt ?? DateTime.UtcNow,
                HostId = sc.HostId,
                TourDetails = sc.ServicecomboDetails?.Select(sd => new TourComboDetailDto
                {
                    ServiceId = sd.ServiceId,
                    Quantity = sd.Quantity ?? 1
                }).ToList() ?? new List<TourComboDetailDto>()
            }).ToList();

            return tourComboResponseDtos;
        }

        public async Task<PaginatedTourComboResponseDto> SearchTourCombosAsync(TourComboSearchDto searchDto)
        {
            var query = _context.Servicecombos
                .Include(sc => sc.ServicecomboDetails)
                .AsQueryable();

            // Filter by keyword (search in name and description)
            if (!string.IsNullOrWhiteSpace(searchDto.Keyword))
            {
                var keyword = searchDto.Keyword.ToLower();
                query = query.Where(sc =>
                    sc.Name.ToLower().Contains(keyword) ||
                    (sc.Description != null && sc.Description.ToLower().Contains(keyword)));
            }

            // Filter by location
            if (!string.IsNullOrWhiteSpace(searchDto.Location))
            {
                var location = searchDto.Location.ToLower();
                query = query.Where(sc => sc.Address.ToLower().Contains(location));
            }

            // Filter by price range
            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(sc => sc.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(sc => sc.Price <= searchDto.MaxPrice.Value);
            }

            // Filter by status
            if (!string.IsNullOrWhiteSpace(searchDto.Status))
            {
                query = query.Where(sc => sc.Status == searchDto.Status);
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync();

            // Sorting
            var sortBy = searchDto.SortBy?.ToLower() ?? "createdat";
            var sortOrder = searchDto.SortOrder?.ToLower() ?? "desc";

            query = sortBy switch
            {
                "name" => sortOrder == "asc"
                    ? query.OrderBy(sc => sc.Name)
                    : query.OrderByDescending(sc => sc.Name),
                "price" => sortOrder == "asc"
                    ? query.OrderBy(sc => sc.Price)
                    : query.OrderByDescending(sc => sc.Price),
                "createdat" => sortOrder == "asc"
                    ? query.OrderBy(sc => sc.CreatedAt)
                    : query.OrderByDescending(sc => sc.CreatedAt),
                _ => query.OrderByDescending(sc => sc.CreatedAt)
            };

            // Pagination
            var pageNumber = searchDto.PageNumber < 1 ? 1 : searchDto.PageNumber;
            var pageSize = searchDto.PageSize < 1 ? 10 : searchDto.PageSize;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var serviceCombos = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = serviceCombos.Select(sc => new TourComboResponseDto
            {
                Id = sc.Id,
                Name = sc.Name,
                Address = sc.Address,
                Description = sc.Description,
                Price = sc.Price,
                AvailableSlots = sc.AvailableSlots,
                Image = sc.Image,
                Status = sc.Status,
                CancellationPolicy = sc.CancellationPolicy,
                CreatedAt = sc.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = sc.UpdatedAt ?? DateTime.UtcNow,
                HostId = sc.HostId,
                TourDetails = sc.ServicecomboDetails?.Select(sd => new TourComboDetailDto
                {
                    ServiceId = sd.ServiceId,
                    Quantity = sd.Quantity ?? 1
                }).ToList() ?? new List<TourComboDetailDto>()
            }).ToList();

            return new PaginatedTourComboResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPreviousPage = pageNumber > 1,
                HasNextPage = pageNumber < totalPages
            };
        }

        public async Task<TourComboDetailResponseDto?> GetTourComboByIdAsync(int id)
        {
            var serviceCombo = await _context.Servicecombos
                .Include(sc => sc.Host)
                .Include(sc => sc.ServicecomboDetails)
                    .ThenInclude(sd => sd.Service)
                .Include(sc => sc.Reviews)
                    .ThenInclude(r => r.Author)
                .Include(sc => sc.Reviews)
                    .ThenInclude(r => r.InverseParentReview)
                        .ThenInclude(reply => reply.Author)
                .FirstOrDefaultAsync(sc => sc.Id == id);

            if (serviceCombo == null)
            {
                return null;
            }

            // Calculate average rating
            var reviews = serviceCombo.Reviews.Where(r => r.ParentReviewId == null).ToList();
            var averageRating = reviews.Any()
                ? (decimal)reviews.Average(r => r.Rating ?? 0)
                : 0;

            var result = new TourComboDetailResponseDto
            {
                Id = serviceCombo.Id,
                Name = serviceCombo.Name,
                Address = serviceCombo.Address,
                Description = serviceCombo.Description,
                Price = serviceCombo.Price,
                AvailableSlots = serviceCombo.AvailableSlots,
                Image = serviceCombo.Image,
                Status = serviceCombo.Status,
                CancellationPolicy = serviceCombo.CancellationPolicy,
                CreatedAt = serviceCombo.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = serviceCombo.UpdatedAt ?? DateTime.UtcNow,
                Host = new HostInfoDto
                {
                    Id = serviceCombo.Host.Id,
                    Name = serviceCombo.Host.Name,
                    Avatar = serviceCombo.Host.Avatar,
                    Phone = serviceCombo.Host.Phone,
                    Email = serviceCombo.Host.Email
                },
                Services = serviceCombo.ServicecomboDetails?.Select(sd => new ServiceInfoDto
                {
                    Id = sd.Service.Id,
                    Name = sd.Service.Name,
                    Description = sd.Service.Description,
                    Price = sd.Service.Price,
                    Quantity = sd.Quantity ?? 1
                }).ToList() ?? new List<ServiceInfoDto>(),
                Reviews = reviews.Select(r => new ReviewInfoDto
                {
                    Id = r.Id,
                    Rating = r.Rating ?? 0,
                    Content = r.Content,
                    CreatedAt = r.CreatedAt ?? DateTime.UtcNow,
                    Author = new AuthorInfoDto
                    {
                        Id = r.Author.Id,
                        Name = r.Author.Name,
                        Avatar = r.Author.Avatar
                    },
                    Replies = r.InverseParentReview?.Select(reply => new ReviewInfoDto
                    {
                        Id = reply.Id,
                        Rating = reply.Rating ?? 0,
                        Content = reply.Content,
                        CreatedAt = reply.CreatedAt ?? DateTime.UtcNow,
                        Author = new AuthorInfoDto
                        {
                            Id = reply.Author.Id,
                            Name = reply.Author.Name,
                            Avatar = reply.Author.Avatar
                        }
                    }).ToList() ?? new List<ReviewInfoDto>()
                }).ToList(),
                AverageRating = averageRating,
                TotalReviews = reviews.Count
            };

            return result;
        }

        public async Task<int> CreateCouponAsync(CreateCouponDto createCouponDto)
        {
            // For now, use a default host ID since we're not requiring authentication
            // In a real app, you'd get this from the authenticated user
            int hostId = 4; // Use the host account (Farm Happy Land)

            var coupon = new Coupon
            {
                Code = createCouponDto.Code,
                Description = createCouponDto.Description,
                DiscountPercent = createCouponDto.DiscountPercent,
                DiscountAmount = createCouponDto.DiscountAmount,
                UsageLimit = createCouponDto.UsageLimit,
                UsageCount = 0,
                HostId = hostId,
                ServicecomboId = createCouponDto.ServicecomboId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Add the coupon to the database
            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return coupon.Id;
        }

        public async Task<List<CouponResponseDto>> GetAllCouponsAsync()
        {
            var coupons = await _context.Coupons
                .ToListAsync();

            var couponResponseDtos = coupons.Select(c => new CouponResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                Description = c.Description,
                DiscountPercent = c.DiscountPercent,
                DiscountAmount = c.DiscountAmount,
                UsageLimit = c.UsageLimit,
                UsageCount = c.UsageCount ?? 0,
                HostId = c.HostId,
                ServicecomboId = c.ServicecomboId,
                IsActive = c.IsActive ?? true,
                CreatedAt = c.CreatedAt ?? DateTime.UtcNow,
                UpdatedAt = c.UpdatedAt ?? DateTime.UtcNow
            }).ToList();

            return couponResponseDtos;
        }

        // Social Media implementations
        public async Task<int> CreateSocialPostAsync(CreatePostDto createPostDto)
        {
            var post = new Post
            {
                Title = createPostDto.Title,
                Content = createPostDto.Content,
                AuthorId = createPostDto.AuthorId,
                Image = createPostDto.Image,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post.Id;
        }

        public async Task<List<PostResponseDto>> GetAllSocialPostsAsync()
        {
            var posts = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(p => new PostResponseDto
            {
                Id = p.Id,
                Title = p.Title,
                Content = p.Content,
                AuthorId = p.AuthorId,
                AuthorName = p.Author?.Name ?? "Unknown",
                Image = p.Image,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                CommentsCount = p.Comments?.Count ?? 0,
                ReactionsCount = 0 // TODO: Add reactions count when Reactions navigation property is available
            }).ToList();
        }

        public async Task<int> CreateCommentAsync(CreateCommentDto createCommentDto)
        {
            var comment = new Comment
            {
                PostId = createCommentDto.PostId,
                AuthorId = createCommentDto.AuthorId,
                ParentCommentId = createCommentDto.ParentCommentId,
                Content = createCommentDto.Content,
                Image = createCommentDto.Image,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return comment.Id;
        }

        public async Task<int> CreateReactionAsync(CreateReactionDto createReactionDto)
        {
            // Check if reaction already exists
            var existingReaction = await _context.Reactions
                .FirstOrDefaultAsync(r =>
                    r.UserId == createReactionDto.UserId &&
                    r.TargetType == createReactionDto.TargetType &&
                    r.TargetId == createReactionDto.TargetId);

            if (existingReaction != null)
            {
                // Update existing reaction
                existingReaction.ReactionType = createReactionDto.ReactionType;
                existingReaction.CreatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return existingReaction.Id;
            }
            else
            {
                // Create new reaction
                var reaction = new Reaction
                {
                    UserId = createReactionDto.UserId,
                    TargetType = createReactionDto.TargetType,
                    TargetId = createReactionDto.TargetId,
                    ReactionType = createReactionDto.ReactionType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reactions.Add(reaction);
                await _context.SaveChangesAsync();
                return reaction.Id;
            }
        }
    }
}