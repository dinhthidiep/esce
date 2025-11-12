namespace ESCE_SYSTEM.DTOs
{
    public class CreateServiceComboDetailDto
    {
        public int ServiceComboId { get; set; }
        public int ServiceId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}

