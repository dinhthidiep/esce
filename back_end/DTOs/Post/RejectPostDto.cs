namespace ESCE_SYSTEM.DTOs.Post
{
    public class RejectPostDto
    {
        public int PostId { get; set; } // int ID
        public string Comment { get; set; } = null!; // Lý do từ chối
    }
}
