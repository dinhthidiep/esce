using ESCE_SYSTEM.DTOs.Home;

namespace ESCE_SYSTEM.Services.HomeService
{
    public interface IHomeService
    {
        Task<IEnumerable<TestimonialDto>> GetTestimonialsAsync(int limit = 3);
        Task<IEnumerable<MostLikedComboDto>> GetMostLikedCombosAsync(int limit = 3);
    }
}

