using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs.Tours
{
    public class CreateTourDto
    {
        [Required(ErrorMessage = "Tên tour là bắt buộc")]
        [StringLength(255, ErrorMessage = "Tên tour không được vượt quá 255 ký tự")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "Địa chỉ là bắt buộc")]
        [StringLength(255, ErrorMessage = "Địa chỉ không được vượt quá 255 ký tự")]
        public string Address { get; set; } = null!;

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Giá tour là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Giá tour phải lớn hơn hoặc bằng 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "Số slot là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Sức chứa phải lớn hơn 0")]
        public int Capacity { get; set; }

        [StringLength(255, ErrorMessage = "Đường dẫn hình ảnh không được vượt quá 255 ký tự")]
        public string? Image { get; set; }

        [StringLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        public string? Status { get; set; } = "open";

        [Required(ErrorMessage = "ID người tổ chức là bắt buộc")]
        public int HostId { get; set; }
    }
}

