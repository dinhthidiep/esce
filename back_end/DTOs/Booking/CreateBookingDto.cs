using System;
using System.ComponentModel.DataAnnotations;

namespace ESCE_SYSTEM.DTOs.Booking
{
    public class CreateBookingDto
    {
        [Required]
        public int ComboId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        public string? Notes { get; set; }

        public List<string>? CouponCodes { get; set; }
    }
}

