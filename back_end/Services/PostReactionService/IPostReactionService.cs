using ESCE_SYSTEM.DTOs;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services
{
    public interface IPostReactionService
    {
        Task<PostToggleLikeResponseDto> ToggleLikePost(int postId);
        Task<PostLikeResponseDto> LikePost(int postId);
        Task<int> UnlikePost(int postReactionId);
        Task<int> GetLikeCount(int postId);
    }
}