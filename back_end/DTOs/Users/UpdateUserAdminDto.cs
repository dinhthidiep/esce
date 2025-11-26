using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs.Users
{
    public class UpdateUserAdminDto
    {
        [Required(ErrorMessage = "AccountId là bắt buộc.")]
        public int AccountId { get; set; }

        [MinLength(2, ErrorMessage = "Họ và tên phải có ít nhất 2 ký tự.")]
        [MaxLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự.")]
        public string? Name { get; set; }

        public string? Avatar { get; set; }

        [RegularExpression(@"^[0-9]{10,11}$", ErrorMessage = "Số điện thoại phải có 10 hoặc 11 chữ số.")]
        public string? Phone { get; set; }

        public DateTime? DOB { get; set; }

        [MaxLength(10, ErrorMessage = "Giới tính không được vượt quá 10 ký tự.")]
        public string? Gender { get; set; }

        [MaxLength(255, ErrorMessage = "Địa chỉ không được vượt quá 255 ký tự.")]
        public string? Address { get; set; }

        public int? RoleId { get; set; }

        public bool? IsBanned { get; set; }
    }
}

