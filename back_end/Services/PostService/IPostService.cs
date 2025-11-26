using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.Models;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services
{
    public interface IPostService
    {
        Task<List<PostResponseDto>> GetAllPosts();
        Task<List<PostResponseDto>> GetAllPostsApproved();
        Task<List<PostResponseDto>> GetAllPostsPending();
        Task<PagedResult<PostResponseDto>> GetPostsPagedAsync(int pageNumber, int pageSize, string status = null, CancellationToken cancellationToken = default);
        Task<Post> GetById(int id);
        Task<PostDetailDto> Create(PostDto post);
        Task Update(int id, PostDto post);
        Task Delete(int id);
        Task Approve(ApprovePostDto approvePostDto);
        Task Reject(RejectPostDto rejectPostDto);
        Task Review(ReviewPostDto reviewPostDto);
        Task<PostDetailDto> GetPostDetail(int postId);
    }
}