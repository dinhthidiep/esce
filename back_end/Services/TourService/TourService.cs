using ESCE_SYSTEM.DTOs.Tours;
using ESCE_SYSTEM.Models;
using ESCE_SYSTEM.Repositories.TourRepository;

namespace ESCE_SYSTEM.Services.TourService
{
    public class TourService : ITourService
    {
        private readonly ITourRepository _tourRepository;

        public TourService(ITourRepository tourRepository)
        {
            _tourRepository = tourRepository;
        }

        public async Task<IEnumerable<TourResponseDto>> GetAllToursAsync()
        {
            var tours = await _tourRepository.GetAllToursAsync();
            return tours.Select(MapToResponseDto);
        }

        public async Task<TourResponseDto?> GetTourByIdAsync(int id)
        {
            var tour = await _tourRepository.GetTourByIdAsync(id);
            return tour != null ? MapToResponseDto(tour) : null;
        }

        public async Task<TourResponseDto> CreateTourAsync(CreateTourDto createTourDto)
        {
            // Validate business rules
            if (createTourDto.StartDate >= createTourDto.EndDate)
            {
                throw new ArgumentException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            }

            if (createTourDto.StartDate < DateTime.Today)
            {
                throw new ArgumentException("Ngày bắt đầu không được là ngày trong quá khứ");
            }

            var tour = new Tour
            {
                Name = createTourDto.Name,
                Address = createTourDto.Address,
                Description = createTourDto.Description,
                Price = createTourDto.Price,
                StartDate = createTourDto.StartDate,
                EndDate = createTourDto.EndDate,
                Capacity = createTourDto.Capacity,
                Image = createTourDto.Image,
                Status = createTourDto.Status ?? "open",
                HostId = createTourDto.HostId
            };

            var createdTour = await _tourRepository.CreateTourAsync(tour);
            return MapToResponseDto(createdTour);
        }

        public async Task<TourResponseDto?> UpdateTourAsync(UpdateTourDto updateTourDto)
        {
            // Validate business rules
            if (updateTourDto.StartDate >= updateTourDto.EndDate)
            {
                throw new ArgumentException("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            }

            if (updateTourDto.StartDate < DateTime.Today)
            {
                throw new ArgumentException("Ngày bắt đầu không được là ngày trong quá khứ");
            }

            var existingTour = await _tourRepository.GetTourByIdAsync(updateTourDto.Id);
            if (existingTour == null)
            {
                return null;
            }

            // Check if tour has bookings and capacity is being reduced
            if (updateTourDto.Capacity < existingTour.Capacity)
            {
                var bookedSlots = existingTour.Capacity - existingTour.AvailableSlots;
                if (updateTourDto.Capacity < bookedSlots)
                {
                    throw new ArgumentException($"Không thể giảm sức chứa xuống dưới {bookedSlots} vì đã có {bookedSlots} chỗ đã được đặt");
                }
            }

            var tour = new Tour
            {
                Id = updateTourDto.Id,
                Name = updateTourDto.Name,
                Address = updateTourDto.Address,
                Description = updateTourDto.Description,
                Price = updateTourDto.Price,
                StartDate = updateTourDto.StartDate,
                EndDate = updateTourDto.EndDate,
                Capacity = updateTourDto.Capacity,
                Image = updateTourDto.Image,
                Status = updateTourDto.Status ?? existingTour.Status,
                HostId = updateTourDto.HostId
            };

            var updatedTour = await _tourRepository.UpdateTourAsync(tour);
            return updatedTour != null ? MapToResponseDto(updatedTour) : null;
        }

        public async Task<bool> DeleteTourAsync(int id)
        {
            var tour = await _tourRepository.GetTourByIdAsync(id);
            if (tour == null)
            {
                return false;
            }

            // Check if tour has bookings
            var bookedSlots = tour.Capacity - tour.AvailableSlots;
            if (bookedSlots > 0)
            {
                throw new InvalidOperationException($"Không thể xóa tour vì đã có {bookedSlots} chỗ đã được đặt. Vui lòng hủy các booking trước khi xóa tour.");
            }

            return await _tourRepository.DeleteTourAsync(id);
        }

        public async Task<(IEnumerable<TourResponseDto> Tours, int TotalCount)> SearchToursAsync(TourSearchDto searchDto)
        {
            var tours = await _tourRepository.SearchToursAsync(searchDto);
            var totalCount = await _tourRepository.GetTotalToursCountAsync(searchDto);
            
            var tourDtos = tours.Select(MapToResponseDto);
            return (tourDtos, totalCount);
        }

        public async Task<IEnumerable<TourResponseDto>> GetToursByHostIdAsync(int hostId)
        {
            var tours = await _tourRepository.GetToursByHostIdAsync(hostId);
            return tours.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TourResponseDto>> GetAvailableToursAsync()
        {
            var tours = await _tourRepository.GetAvailableToursAsync();
            return tours.Select(MapToResponseDto);
        }

        public async Task<bool> TourExistsAsync(int id)
        {
            return await _tourRepository.TourExistsAsync(id);
        }

        private static TourResponseDto MapToResponseDto(Tour tour)
        {
            // Tính đánh giá trung bình
            double? averageRating = null;
            int totalReviews = 0;
            
            if (tour.Reviews != null && tour.Reviews.Any())
            {
                averageRating = Math.Round(tour.Reviews.Average(r => r.Rating), 1);
                totalReviews = tour.Reviews.Count;
            }

            return new TourResponseDto
            {
                Id = tour.Id,
                Name = tour.Name,
                Address = tour.Address,
                Description = tour.Description,
                Price = tour.Price,
                StartDate = tour.StartDate,
                EndDate = tour.EndDate,
                Capacity = tour.Capacity,
                AvailableSlots = tour.AvailableSlots,
                Image = tour.Image,
                Status = tour.Status,
                CreatedAt = tour.CreatedAt,
                UpdatedAt = tour.UpdatedAt,
                HostId = tour.HostId,
                HostName = tour.Host?.Name,
                AverageRating = averageRating,
                TotalReviews = totalReviews
            };
        }
    }
}

