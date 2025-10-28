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
    }
}