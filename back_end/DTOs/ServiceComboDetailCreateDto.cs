using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs
{
    public class ServiceComboDetailCreateDto
    {
        [Required(ErrorMessage = "ServiceComboId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "ServiceComboId must be greater than 0")]
        public int ServiceComboId { get; set; }

        [Required(ErrorMessage = "ServiceId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "ServiceId must be greater than 0")]
        public int ServiceId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; } = 1;
    }
}

