using ESCE_SYSTEM.DTOs;
using ESCE_SYSTEM.DTOs.Post;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.PostRepository;
using ESCE_SYSTEM.Services.UserContextService;
using Mapster;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ESCE_SYSTEM.Services.PostService
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IUserContextService _userContextService;
        // ... (Giả sử bạn có các dependencies khác như UserService, NotificationService)

        public PostService(IPostRepository postRepository, IUserContextService userContextService /*, ...*/)
        {
            _postRepository = postRepository;
            _userContextService = userContextService;
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
    }
}