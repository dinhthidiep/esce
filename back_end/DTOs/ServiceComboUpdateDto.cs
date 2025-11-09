using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs
{
    public class ServiceComboUpdateDto
    {
        [Required(ErrorMessage = "Name is required")]
        [MaxLength(255, ErrorMessage = "Name cannot exceed 255 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required")]
        [MaxLength(255, ErrorMessage = "Address cannot exceed 255 characters")]
        public string Address { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Price is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Price must be greater than or equal to 0")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "AvailableSlots is required")]
        [Range(1, int.MaxValue, ErrorMessage = "AvailableSlots must be at least 1")]
        public int AvailableSlots { get; set; }

        public string? Image { get; set; }

        [MaxLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
        public string Status { get; set; } = "open";

        [MaxLength(1000, ErrorMessage = "CancellationPolicy cannot exceed 1000 characters")]
        public string? CancellationPolicy { get; set; }
    }
}

