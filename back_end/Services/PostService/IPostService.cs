using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services.PostService
{
    public interface IPostService
    {
        Task<List<PostResponseDto>> GetAllPostsAsync();
        Task<List<Post>> GetAllPostsApprovedAsync();
        Task<List<Post>> GetAllPostsPendingAsync();
        Task<Post?> GetByIdAsync(int id);
        Task<Post> CreateAsync(PostDto postDto);
        Task UpdateAsync(int id, PostDto postDto);
        Task DeleteAsync(int id);
        Task ApproveAsync(ApprovePostDto approvePostDto);
        Task RejectAsync(RejectPostDto rejectPostDto);

        // Tour-related methods
        Task<int> CreateTourAsync(CreateTourDto createTourDto);
        Task<List<TourResponseDto>> GetAllToursAsync();

        // Tour Combo methods
        Task<int> CreateTourComboAsync(CreateTourComboDto createTourComboDto);
        Task<List<TourComboResponseDto>> GetAllTourCombosAsync();
        Task<PaginatedTourComboResponseDto> SearchTourCombosAsync(TourComboSearchDto searchDto);
        Task<TourComboDetailResponseDto?> GetTourComboByIdAsync(int id);

        // Coupon methods
        Task<int> CreateCouponAsync(CreateCouponDto createCouponDto);
        Task<List<CouponResponseDto>> GetAllCouponsAsync();

        // Social Media methods
        Task<int> CreateSocialPostAsync(CreatePostDto createPostDto);
        Task<List<PostResponseDto>> GetAllSocialPostsAsync();
        Task<int> CreateCommentAsync(CreateCommentDto createCommentDto);
        Task<int> CreateReactionAsync(CreateReactionDto createReactionDto);
    }
}