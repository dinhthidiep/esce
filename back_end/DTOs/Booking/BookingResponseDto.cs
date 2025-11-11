using System;

namespace ESCE_SYSTEM.DTOs.Booking
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ComboId { get; set; }
        public string ComboName { get; set; } = string.Empty;
        public DateTime? BookingDate { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Notes { get; set; }
        public string? Status { get; set; }
    }
}

