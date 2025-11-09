namespace ESCE_SYSTEM.DTOs
{
    public class ServiceCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
    }
}